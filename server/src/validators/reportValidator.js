import { z } from 'zod';
import { isValidDateString } from '../utils/dateUtils.js';

export const reportQuerySchema = z.object({
  date: z
    .string({ required_error: 'Date parameter is required (format: YYYY-MM-DD).' })
    .trim()
    .refine((val) => isValidDateString(val), {
      message: 'Please provide a valid date in YYYY-MM-DD format.',
    }),
});
