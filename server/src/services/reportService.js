import { prisma } from '../config/database.js';
import {
  getMonthToDateRange,
  getPreviousCalendarMonthRange,
  isValidDateString,
} from '../utils/dateUtils.js';

export const EMPTY_REPORT_MESSAGE =
  'No readings yet. Start tracking your glucose to see your health insights here.';

/**
 * Standard slot order for chronological sorting in reports
 */
const SLOT_ORDER = {
  'Morning (Fasting)': 1,
  'After breakfast': 2,
  'After lunch': 3,
  'After dinner': 4,
};

/**
 * Helper to compute statistical metrics from an array of readings
 */
export const computeStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      count: 0,
      highest: null,
      lowest: null,
      average: null,
      isEmpty: true,
      emptyMessage: EMPTY_REPORT_MESSAGE,
    };
  }

  const values = readings.map((r) => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const average = Math.round((sum / values.length) * 10) / 10;

  return {
    count: readings.length,
    highest,
    lowest,
    average,
    isEmpty: false,
    emptyMessage: null,
  };
};

/**
 * Group readings by date for charts
 */
export const buildTrendData = (readings) => {
  const map = new Map();

  readings.forEach((r) => {
    if (!map.has(r.date)) {
      map.set(r.date, []);
    }
    map.get(r.date).push(r);
  });

  const dates = Array.from(map.keys()).sort();

  return dates.map((date) => {
    const dayReadings = map.get(date);
    const dayValues = dayReadings.map((r) => r.value);
    const highest = Math.max(...dayValues);
    const lowest = Math.min(...dayValues);
    const sum = dayValues.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / dayValues.length) * 10) / 10;

    return {
      date,
      count: dayReadings.length,
      average,
      highest,
      lowest,
      readings: dayReadings,
    };
  });
};

/**
 * DAILY REPORT: Selected date only
 */
export const getDailyReport = async (userId, date) => {
  if (!isValidDateString(date)) {
    const error = new Error('Please provide a valid date in YYYY-MM-DD format.');
    error.statusCode = 400;
    throw error;
  }

  const readings = await prisma.reading.findMany({
    where: {
      userId,
      date,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Sort readings by standard daily slot order
  readings.sort((a, b) => (SLOT_ORDER[a.slot] || 99) - (SLOT_ORDER[b.slot] || 99));

  const stats = computeStats(readings);

  return {
    reportType: 'daily',
    date,
    ...stats,
    readings,
  };
};

/**
 * MONTH-TO-DATE REPORT: First day of selected month through selected date
 * Example: 2026-10-15 -> 2026-10-01 to 2026-10-15
 */
export const getMonthToDateReport = async (userId, date) => {
  if (!isValidDateString(date)) {
    const error = new Error('Please provide a valid date in YYYY-MM-DD format.');
    error.statusCode = 400;
    throw error;
  }

  const { startDate, endDate, year, month } = getMonthToDateRange(date);

  const readings = await prisma.reading.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const stats = computeStats(readings);
  const trend = buildTrendData(readings);

  return {
    reportType: 'month-to-date',
    selectedDate: date,
    startDate,
    endDate,
    year,
    month,
    ...stats,
    trend,
    readings,
  };
};

/**
 * MONTHLY REPORT: Entire previous calendar month relative to selected date's month
 * Example: 2026-10-15 -> 2026-09-01 to 2026-09-30
 */
export const getMonthlyReport = async (userId, date) => {
  if (!isValidDateString(date)) {
    const error = new Error('Please provide a valid date in YYYY-MM-DD format.');
    error.statusCode = 400;
    throw error;
  }

  const { startDate, endDate, year, month, monthName } = getPreviousCalendarMonthRange(date);

  const readings = await prisma.reading.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const stats = computeStats(readings);
  const trend = buildTrendData(readings);

  return {
    reportType: 'monthly-previous',
    selectedDate: date,
    startDate,
    endDate,
    year,
    month,
    monthName,
    ...stats,
    trend,
    readings,
  };
};

