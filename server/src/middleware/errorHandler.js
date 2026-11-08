import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  // If response already committed, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload in request body.', 400);
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || [];
    if (target.includes('email')) {
      return sendError(res, 'An account with this email already exists.', 409);
    }
    if (target.includes('date') && target.includes('slot')) {
      const slot = req.body?.slot || 'specified';
      return sendError(res, `You already have an ${slot} reading for this date.`, 409);
    }
    return sendError(res, 'A unique constraint violation occurred.', 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Requested resource was not found or has been removed.', 404);
  }

  // Custom application error with statusCode
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // In production, do not leak internal stack traces or database driver errors
  if (env.NODE_ENV === 'production' && statusCode === 500) {
    console.error('[SWEETY INTERNAL ERROR]', err);
    return sendError(res, 'An unexpected internal server error occurred.', 500);
  }

  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[SWEETY DEV ERROR]', err);
  }

  return sendError(res, message, statusCode);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
