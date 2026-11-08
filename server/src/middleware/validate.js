import { sendError } from '../utils/response.js';

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} [source='body']
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        const firstError = err.errors[0];
        const errorMessage = firstError.message || 'Validation error';
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, errorMessage, 400, formattedErrors);
      }
      return sendError(res, err.message || 'Validation failed', 400);
    }
  };
};

