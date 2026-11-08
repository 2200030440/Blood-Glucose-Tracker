import { prisma } from '../config/database.js';
import { isFutureDate, isValidDateString } from '../utils/dateUtils.js';

// Mutex map for atomic concurrency protection per user/date
const activeTransactions = new Map();

const acquireLock = async (key) => {
  while (activeTransactions.has(key)) {
    await activeTransactions.get(key);
  }
  let resolver;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  activeTransactions.set(key, promise);
  return () => {
    activeTransactions.delete(key);
    resolver();
  };
};

/**
 * Format duplicate slot error message according to assignment specification
 * Example: "You already have an After lunch reading for this date."
 */
export const formatDuplicateSlotMessage = (slot) => {
  const article = /^[aeiou]/i.test(slot) ? 'an' : 'a';
  return `You already have ${article} ${slot} reading for this date.`;
};

/**
 * Create a new glucose reading with strict validation and concurrency control
 */
export const createReading = async (userId, { date, slot, value }) => {
  // 1. Mandatory rule: Date cannot be in the future
  if (!isValidDateString(date)) {
    const error = new Error('Please provide a valid calendar date in YYYY-MM-DD format.');
    error.statusCode = 400;
    throw error;
  }

  if (isFutureDate(date)) {
    const error = new Error('Date cannot be in the future.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Mandatory rule: Value required
  if (value === undefined || value === null || value === '') {
    const error = new Error('Please enter a glucose value.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Mandatory rule: Value must be whole number between 40 and 600
  const numValue = Number(value);
  if (isNaN(numValue) || !Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
    const error = new Error('Value must be between 40 and 600 mg/dl.');
    error.statusCode = 400;
    throw error;
  }

  // Concurrency-safe lock per user & date
  const lockKey = `${userId}:${date}`;
  const releaseLock = await acquireLock(lockKey);

  try {
    return await prisma.$transaction(async (tx) => {
      // Check Postgres advisory lock if raw query is supported
      if (typeof tx.$executeRawUnsafe === 'function') {
        try {
          await tx.$executeRawUnsafe(
            `SELECT pg_advisory_xact_lock(hashtext($1))`,
            `${userId}_${date}`
          );
        } catch {
          // Fallback if not postgres
        }
      }

      // Check current daily count (maximum 4 readings per day)
      const count = await tx.reading.count({
        where: { userId, date },
      });

      if (count >= 4) {
        const error = new Error('You can add only 4 readings per day.');
        error.statusCode = 400;
        throw error;
      }

      // Check duplicate slot for date
      const existingSlot = await tx.reading.findFirst({
        where: { userId, date, slot },
      });

      if (existingSlot) {
        const error = new Error(formatDuplicateSlotMessage(slot));
        error.statusCode = 409;
        throw error;
      }

      // Create reading
      return await tx.reading.create({
        data: {
          userId,
          date,
          slot,
          value: numValue,
        },
      });
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error(formatDuplicateSlotMessage(slot));
      error.statusCode = 409;
      throw error;
    }
    throw err;
  } finally {
    releaseLock();
  }
};

/**
 * Retrieve user's readings with optional pagination and date filtering
 */
export const getReadings = async (userId, { date, page, limit } = {}) => {
  const where = { userId };
  if (date) {
    where.date = date;
  }

  const queryOptions = {
    where,
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' },
    ],
  };

  // Optional pagination
  if (page && limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    queryOptions.skip = (pageNum - 1) * limitNum;
    queryOptions.take = limitNum;

    const [readings, total] = await Promise.all([
      prisma.reading.findMany(queryOptions),
      prisma.reading.count({ where }),
    ]);

    return {
      readings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  const readings = await prisma.reading.findMany(queryOptions);
  return { readings };
};

/**
 * Retrieve a single reading by ID with strict user isolation
 */
export const getReadingById = async (userId, readingId) => {
  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
  });

  if (!reading || reading.userId !== userId) {
    const error = new Error('Reading not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  return reading;
};

/**
 * Update an existing reading with validation and duplicate prevention
 */
export const updateReading = async (userId, readingId, updates) => {
  // First verify existence and ownership
  const existing = await getReadingById(userId, readingId);

  const targetDate = updates.date || existing.date;
  const targetSlot = updates.slot || existing.slot;
  const targetValue = updates.value !== undefined ? updates.value : existing.value;

  // Validation: Date cannot be in future
  if (updates.date) {
    if (!isValidDateString(targetDate)) {
      const error = new Error('Please provide a valid calendar date in YYYY-MM-DD format.');
      error.statusCode = 400;
      throw error;
    }
    if (isFutureDate(targetDate)) {
      const error = new Error('Date cannot be in the future.');
      error.statusCode = 400;
      throw error;
    }
  }

  // Validation: Value checks
  if (updates.value !== undefined) {
    if (updates.value === null || updates.value === '') {
      const error = new Error('Please enter a glucose value.');
      error.statusCode = 400;
      throw error;
    }
    const numValue = Number(updates.value);
    if (isNaN(numValue) || !Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      const error = new Error('Value must be between 40 and 600 mg/dl.');
      error.statusCode = 400;
      throw error;
    }
  }

  // Concurrency-safe lock
  const lockKey = `${userId}:${targetDate}`;
  const releaseLock = await acquireLock(lockKey);

  try {
    return await prisma.$transaction(async (tx) => {
      // If date is changing, ensure target date has < 4 readings
      if (updates.date && updates.date !== existing.date) {
        const count = await tx.reading.count({
          where: { userId, date: targetDate },
        });
        if (count >= 4) {
          const error = new Error('You can add only 4 readings per day.');
          error.statusCode = 400;
          throw error;
        }
      }

      // Check slot duplication: Ensure no OTHER reading has the same slot on targetDate
      // (Do NOT reject the existing reading as a duplicate of itself)
      const slotConflict = await tx.reading.findFirst({
        where: {
          userId,
          date: targetDate,
          slot: targetSlot,
          id: { not: readingId },
        },
      });

      if (slotConflict) {
        const error = new Error(formatDuplicateSlotMessage(targetSlot));
        error.statusCode = 409;
        throw error;
      }

      const updateData = {};
      if (updates.date) updateData.date = targetDate;
      if (updates.slot) updateData.slot = targetSlot;
      if (updates.value !== undefined) updateData.value = Number(targetValue);

      return await tx.reading.update({
        where: { id: readingId },
        data: updateData,
      });
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error(formatDuplicateSlotMessage(targetSlot));
      error.statusCode = 409;
      throw error;
    }
    throw err;
  } finally {
    releaseLock();
  }
};

/**
 * Delete a reading with strict user isolation
 */
export const deleteReading = async (userId, readingId) => {
  // First verify existence and ownership
  await getReadingById(userId, readingId);

  return await prisma.reading.delete({
    where: { id: readingId },
  });
};

