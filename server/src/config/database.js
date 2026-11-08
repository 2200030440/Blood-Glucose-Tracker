import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

let prisma;

/**
 * In-Memory Prisma Mock for isolated testing and fallback
 */
class InMemoryPrismaClient {
  constructor() {
    this.users = new Map();
    this.readings = new Map();
    this.initModels();
  }

  initModels() {
    this.user = {
      findUnique: async ({ where }) => {
        for (const u of this.users.values()) {
          if (where.id && u.id === where.id) return { ...u };
          if (where.email && u.email.toLowerCase() === where.email.toLowerCase()) return { ...u };
        }
        return null;
      },
      create: async ({ data }) => {
        // Unique check
        for (const u of this.users.values()) {
          if (u.email.toLowerCase() === data.email.toLowerCase()) {
            const err = new Error('Unique constraint failed on the fields: (`email`)');
            err.code = 'P2002';
            err.meta = { target: ['email'] };
            throw err;
          }
        }
        const id = data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        const user = {
          id,
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          createdAt: now,
          updatedAt: now,
        };
        this.users.set(id, user);
        return { ...user };
      },
      deleteMany: async () => {
        const count = this.users.size;
        this.users.clear();
        return { count };
      },
      count: async () => this.users.size,
    };

    this.reading = {
      findUnique: async ({ where }) => {
        const r = this.readings.get(where.id);
        return r ? { ...r } : null;
      },
      findFirst: async ({ where }) => {
        const list = Array.from(this.readings.values());
        for (const r of list) {
          if (where.userId && r.userId !== where.userId) continue;
          if (where.date && r.date !== where.date) continue;
          if (where.slot && r.slot !== where.slot) continue;
          if (where.id?.not && r.id === where.id.not) continue;
          return { ...r };
        }
        return null;
      },
      findMany: async ({ where = {}, orderBy = {} }) => {
        let results = Array.from(this.readings.values()).filter((r) => {
          if (where.userId && r.userId !== where.userId) return false;
          if (where.date) {
            if (typeof where.date === 'string' && r.date !== where.date) return false;
            if (where.date.gte && r.date < where.date.gte) return false;
            if (where.date.lte && r.date > where.date.lte) return false;
          }
          if (where.slot && r.slot !== where.slot) return false;
          return true;
        });

        // Ordering
        if (orderBy.date || orderBy.createdAt) {
          results.sort((a, b) => {
            const dir = (orderBy.date || orderBy.createdAt) === 'desc' ? -1 : 1;
            if (a.date !== b.date) {
              return a.date > b.date ? dir : -dir;
            }
            return (a.createdAt > b.createdAt ? dir : -dir);
          });
        }

        return results.map((r) => ({ ...r }));
      },
      count: async ({ where = {} }) => {
        const list = await this.reading.findMany({ where });
        return list.length;
      },
      create: async ({ data }) => {
        // Enforce DB unique constraint (userId, date, slot)
        for (const r of this.readings.values()) {
          if (r.userId === data.userId && r.date === data.date && r.slot === data.slot) {
            const err = new Error('Unique constraint failed on the fields: (`userId`, `date`, `slot`)');
            err.code = 'P2002';
            err.meta = { target: ['userId', 'date', 'slot'] };
            throw err;
          }
        }
        const id = data.id || `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        const reading = {
          id,
          userId: data.userId,
          date: data.date,
          slot: data.slot,
          value: data.value,
          createdAt: now,
          updatedAt: now,
        };
        this.readings.set(id, reading);
        return { ...reading };
      },
      update: async ({ where, data }) => {
        const existing = this.readings.get(where.id);
        if (!existing) {
          const err = new Error('Record not found');
          err.code = 'P2025';
          throw err;
        }

        const newDate = data.date || existing.date;
        const newSlot = data.slot || existing.slot;

        // Unique check
        for (const r of this.readings.values()) {
          if (r.id !== where.id && r.userId === existing.userId && r.date === newDate && r.slot === newSlot) {
            const err = new Error('Unique constraint failed on the fields: (`userId`, `date`, `slot`)');
            err.code = 'P2002';
            err.meta = { target: ['userId', 'date', 'slot'] };
            throw err;
          }
        }

        const updated = {
          ...existing,
          ...(data.date !== undefined && { date: data.date }),
          ...(data.slot !== undefined && { slot: data.slot }),
          ...(data.value !== undefined && { value: data.value }),
          updatedAt: new Date(),
        };
        this.readings.set(where.id, updated);
        return { ...updated };
      },
      delete: async ({ where }) => {
        const existing = this.readings.get(where.id);
        if (!existing) {
          const err = new Error('Record not found');
          err.code = 'P2025';
          throw err;
        }
        this.readings.delete(where.id);
        return { ...existing };
      },
      deleteMany: async () => {
        const count = this.readings.size;
        this.readings.clear();
        return { count };
      },
      aggregate: async ({ where = {}, _max, _min, _avg, _count }) => {
        const list = await this.reading.findMany({ where });
        if (list.length === 0) {
          return {
            _count: { value: 0 },
            _max: { value: null },
            _min: { value: null },
            _avg: { value: null },
          };
        }
        const values = list.map((r) => r.value);
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const sum = values.reduce((acc, v) => acc + v, 0);
        const avgVal = sum / values.length;
        return {
          _count: { value: values.length },
          _max: { value: maxVal },
          _min: { value: minVal },
          _avg: { value: avgVal },
        };
      },
    };
  }

  async $transaction(fn) {
    if (typeof fn === 'function') {
      return await fn(this);
    }
    // Array of promises
    return await Promise.all(fn);
  }

  async $connect() {
    return Promise.resolve();
  }

  async $disconnect() {
    return Promise.resolve();
  }
}

// In test environment or explicit fallback, use InMemoryPrismaClient
if (env.NODE_ENV === 'test' || process.env.USE_IN_MEMORY_DB === 'true') {
  prisma = new InMemoryPrismaClient();
} else {
  try {
    prisma = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch (err) {
    console.error('Warning: PrismaClient initialization issue, using in-memory store:', err.message);
    prisma = new InMemoryPrismaClient();
  }
}

/**
 * Pre-populate demo data into InMemoryPrismaClient if in-memory mode is active
 */
export const initInMemoryDemoData = async (inMemoryClient) => {
  if (!(inMemoryClient instanceof InMemoryPrismaClient)) return;

  const demoEmail = 'demo@sweety.app';
  const existing = await inMemoryClient.user.findUnique({ where: { email: demoEmail } });
  if (existing) return;

  // bcrypt hash for 'SweetyDemo@123'
  const passwordHash = '$2a$12$N9qo8uLOickgx2ZMRZoMye.U8D.D9m8I.4oE2p1B9rFfRzE3y1h8a';
  const demoUser = await inMemoryClient.user.create({
    data: {
      name: 'Sweety Demo',
      email: demoEmail,
      passwordHash,
    },
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear = now.getMonth() === 0 ? year - 1 : year;
  const prevMonthStr = String(prevMonth).padStart(2, '0');

  const demoReadings = [
    { date: today, slot: 'Morning (Fasting)', value: 92 },
    { date: today, slot: 'After breakfast', value: 128 },
    { date: today, slot: 'After lunch', value: 114 },
    { date: `${prevYear}-${prevMonthStr}-05`, slot: 'Morning (Fasting)', value: 95 },
    { date: `${prevYear}-${prevMonthStr}-05`, slot: 'After lunch', value: 130 },
    { date: `${prevYear}-${prevMonthStr}-15`, slot: 'Morning (Fasting)', value: 98 },
    { date: `${prevYear}-${prevMonthStr}-15`, slot: 'After lunch', value: 125 },
    { date: `${prevYear}-${prevMonthStr}-25`, slot: 'Morning (Fasting)', value: 91 },
    { date: `${prevYear}-${prevMonthStr}-25`, slot: 'After dinner', value: 138 },
  ];

  for (const r of demoReadings) {
    await inMemoryClient.reading.create({
      data: {
        userId: demoUser.id,
        date: r.date,
        slot: r.slot,
        value: r.value,
      },
    });
  }
};

export { prisma, InMemoryPrismaClient };
export default prisma;
