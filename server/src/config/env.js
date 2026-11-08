import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

// Guarantee default environment variables exist to prevent Prisma P1012
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/sweety_db';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'sweety_jwt_super_secret_production_key_2026';
}
if (!process.env.COOKIE_SECRET) {
  process.env.COOKIE_SECRET = 'sweety_cookie_secret_key_2026';
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;
