import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * In-Memory Prisma Mock for isolated testing and local offline fallback
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
      findFirst: async ({ where = {} } = {}) => {
        for (const u of this.users.values()) {
          if (where.id && u.id !== where.id) continue;
          if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) continue;
          return { ...u };
        }
        return null;
      },
      findMany: async ({ where = {} } = {}) => {
        let list = Array.from(this.users.values());
        if (where.email) list = list.filter((u) => u.email.toLowerCase() === where.email.toLowerCase());
        if (where.id) list = list.filter((u) => u.id === where.id);
        return list.map((u) => ({ ...u }));
      },
      create: async ({ data }) => {
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
      update: async ({ where, data }) => {
        const u = await this.user.findUnique({ where });
        if (!u) {
          const err = new Error('Record not found');
          err.code = 'P2025';
          throw err;
        }
        const updated = { ...u, ...data, updatedAt: new Date() };
        this.users.set(u.id, updated);
        return { ...updated };
      },
      delete: async ({ where }) => {
        const u = await this.user.findUnique({ where });
        if (!u) {
          const err = new Error('Record not found');
          err.code = 'P2025';
          throw err;
        }
        this.users.delete(u.id);
        return { ...u };
      },
      deleteMany: async () => {
        const count = this.users.size;
        this.users.clear();
        return { count };
      },
      count: async () => this.users.size,
      upsert: async ({ where, update, create }) => {
        let existing = null;
        if (where.email) {
          existing = await this.user.findUnique({ where });
        } else if (where.id) {
          existing = await this.user.findUnique({ where });
        }
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          this.users.set(existing.id, updated);
          return { ...updated };
        }
        return await this.user.create({ data: create });
      },
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
        // Enforce unique constraint (userId, date, slot)
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
      upsert: async ({ where, update, create }) => {
        let existing = null;
        if (where.userId_date_slot_unique) {
          const { userId, date, slot } = where.userId_date_slot_unique;
          existing = await this.reading.findFirst({ where: { userId, date, slot } });
        } else if (where.id) {
          existing = await this.reading.findUnique({ where });
        }
        if (existing) {
          return await this.reading.update({ where: { id: existing.id }, data: update });
        }
        return await this.reading.create({ data: create });
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
    return await Promise.all(fn);
  }

  async $connect() {
    return Promise.resolve();
  }

  async $disconnect() {
    return Promise.resolve();
  }
}

const inMemoryClient = new InMemoryPrismaClient();
let realPrisma = null;
let useFallback = env.NODE_ENV === 'test' || process.env.USE_IN_MEMORY_DB === 'true';

// Helper to determine if an error is a database connectivity/configuration issue
const isDatabaseConnectionError = (err) => {
  if (!err) return false;
  const msg = err.message || '';
  return (
    err.code === 'P1001' || // Can't reach database server
    err.code === 'P1012' || // Schema validation / env var missing
    err.code === 'P1003' || // Database does not exist
    msg.includes('Environment variable not found') ||
    msg.includes("Can't reach database server") ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('database system is starting up') ||
    msg.includes('connection refused')
  );
};

if (!useFallback) {
  try {
    realPrisma = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch (err) {
    console.warn('Notice: PrismaClient initialization issue, using in-memory store:', err.message);
    useFallback = true;
  }
}

export const switchToInMemory = () => {
  useFallback = true;
  initInMemoryDemoData(inMemoryClient);
};

export const isUsingInMemory = () => useFallback;
export const getRealPrisma = () => realPrisma;

/**
 * Creates a smart proxy for a model (user, reading) that attempts real Prisma first
 * and seamlessly falls back to the in-memory mock if the database is unreachable or down.
 */
const createModelProxy = (modelName) => {
  return new Proxy({}, {
    get(target, method) {
      return async (...args) => {
        if (useFallback || !realPrisma) {
          return inMemoryClient[modelName][method](...args);
        }
        try {
          return await realPrisma[modelName][method](...args);
        } catch (err) {
          if (isDatabaseConnectionError(err)) {
            console.warn(`[Sweety DB Fallback] PostgreSQL offline (${err.message}). Seamlessly using in-memory store.`);
            switchToInMemory();
            return inMemoryClient[modelName][method](...args);
          }
          throw err;
        }
      };
    }
  });
};

/**
 * Transparent Prisma Proxy:
 * Routes queries to real Prisma (when PostgreSQL is active)
 * or in-memory fallback (when running locally without PostgreSQL).
 */
export const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === 'user') return createModelProxy('user');
    if (prop === 'reading') return createModelProxy('reading');

    if (prop === '$transaction') {
      return async (arg) => {
        if (useFallback || !realPrisma) {
          return inMemoryClient.$transaction(arg);
        }
        try {
          return await realPrisma.$transaction(arg);
        } catch (err) {
          if (isDatabaseConnectionError(err)) {
            switchToInMemory();
            return inMemoryClient.$transaction(arg);
          }
          throw err;
        }
      };
    }

    if (prop === '$connect') {
      return async () => {
        if (useFallback || !realPrisma) return;
        try {
          return await realPrisma.$connect();
        } catch (err) {
          switchToInMemory();
        }
      };
    }

    if (prop === '$disconnect') {
      return async () => {
        if (realPrisma) {
          try {
            await realPrisma.$disconnect();
          } catch {}
        }
      };
    }

    if (useFallback || !realPrisma) {
      const val = inMemoryClient[prop];
      return typeof val === 'function' ? val.bind(inMemoryClient) : val;
    }
    const val = realPrisma[prop];
    return typeof val === 'function' ? val.bind(realPrisma) : val;
  }
});

/**
 * Pre-populate demo data into InMemoryPrismaClient
 */
export const initInMemoryDemoData = async (client = inMemoryClient) => {
  try {
    const demoEmail = 'demo@sweety.app';
    const existing = await client.user.findUnique({ where: { email: demoEmail } });
    if (existing) return;

    // bcrypt hash for 'SweetyDemo@123'
    const passwordHash = '$2a$12$RkN9nQJU5x7dHDAVzQa/zeNBDAVtEAkoLDEI5Ha8Qnr5VswV1HYoS';
    const demoUser = await client.user.create({
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
      await client.reading.create({
        data: {
          userId: demoUser.id,
          date: r.date,
          slot: r.slot,
          value: r.value,
        },
      });
    }
  } catch (err) {
    // Ignore duplicate creation
  }
};

// Automatically ensure demo data exists on the in-memory store immediately
initInMemoryDemoData(inMemoryClient);

export { InMemoryPrismaClient };
export default prisma;
