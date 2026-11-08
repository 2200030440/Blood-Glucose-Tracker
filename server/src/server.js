import app from './app.js';
import { env } from './config/env.js';
import { prisma, initInMemoryDemoData } from './config/database.js';

const PORT = env.PORT;
const HOST = '0.0.0.0';

let server;

const startServer = async () => {
  try {
    // Attempt database connection check
    try {
      await prisma.$connect();
      console.log('✓ Database connection initialized.');
      await initInMemoryDemoData(prisma);
    } catch (dbErr) {
      console.warn('! Notice: Live PostgreSQL not available on local port, using in-memory demo store.');
    }

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
