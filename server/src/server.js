import app from './app.js';
import { env } from './config/env.js';
import { prisma, initInMemoryDemoData, switchToInMemory, isUsingInMemory, getRealPrisma } from './config/database.js';
import { seedDatabase } from '../prisma/seed.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT;
const HOST = '0.0.0.0';

let server;

/**
 * Automatically ensures database migrations and demo data are initialized
 */
const ensureDatabaseReady = async () => {
  // If in-memory is forced or test, pre-populate demo data:
  if (isUsingInMemory()) {
    console.log('✓ Using in-memory demo database.');
    switchToInMemory();
    return;
  }

  const realPrisma = getRealPrisma();

  try {
    await realPrisma.$connect();
    console.log('✓ Database connection established.');

    // 1. Test if tables exist
    let tablesExist = false;
    try {
      await realPrisma.user.count();
      tablesExist = true;
    } catch (err) {
      console.warn('! Database tables not found. Running Prisma migrations now...');
    }

    // 2. If tables do not exist, automatically deploy migrations
    if (!tablesExist) {
      try {
        const schemaPath = fs.existsSync('server/prisma/schema.prisma')
          ? 'server/prisma/schema.prisma'
          : fs.existsSync('prisma/schema.prisma')
          ? 'prisma/schema.prisma'
          : path.resolve(__dirname, '../prisma/schema.prisma');

        console.log(`Applying migrations using schema: ${schemaPath}...`);
        execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, { stdio: 'inherit' });
        console.log('✓ Database migrations applied successfully.');
      } catch (migErr) {
        console.warn('Notice: Migration CLI failed, verifying schema:', migErr.message);
      }
    }

    // 3. Ensure demo user and sample readings exist
    try {
      const demoUser = await realPrisma.user.findUnique({ where: { email: 'demo@sweety.app' } });
      if (!demoUser) {
        console.log('Seeding demo account into database...');
        await seedDatabase(realPrisma);
      } else {
        console.log('✓ Demo account verified in database.');
      }
    } catch (seedErr) {
      console.warn('Notice: Seeding check error:', seedErr.message);
      switchToInMemory();
    }
  } catch (dbErr) {
    console.warn('! Live PostgreSQL not reachable locally. Automatically falling back to in-memory demo store.');
    switchToInMemory();
  }
};

const startServer = async () => {
  try {
    await ensureDatabaseReady();

    server = app.listen(PORT, HOST, () => {
      console.log(`===================================================`);
      console.log(`SWEETY — Blood Glucose Tracker API`);
      console.log(`"A healthier you starts with understanding."`);
      console.log(`Running on: http://${HOST}:${PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Gracefully shutting down Sweety server...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await prisma.$disconnect();
      console.log('Database disconnected.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
