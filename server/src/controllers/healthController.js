import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export const checkHealth = async (req, res) => {
  let dbStatus = 'connected';
  let dbLatencyMs = null;

  try {
    const start = Date.now();
    // Test simple count or connection
    await prisma.user.count();
    dbLatencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  return sendSuccess(res, 'Sweety API is running normally.', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latency: dbLatencyMs !== null ? `${dbLatencyMs}ms` : undefined,
    },
    version: '1.0.0',
    service: 'SWEETY Blood Glucose Tracker',
  });
};
