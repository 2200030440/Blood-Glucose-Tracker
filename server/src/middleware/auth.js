import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/response.js';

/**
 * Authentication middleware
 * Verifies JWT token from HTTP-only cookie or Authorization header.
 * Attaches authenticated user object to req.user.
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.sweety_token) {
      token = req.cookies.sweety_token;
    }

    // 2. Fallback to Authorization: Bearer <token>
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Session expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid authentication payload.', 401);
    }

    // 4. Retrieve user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Authentication verification failed.', 401);
  }
};
