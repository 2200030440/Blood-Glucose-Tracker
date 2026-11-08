import { z } from 'zod';
import { isValidDateString, isFutureDate } from '../utils/dateUtils.js';

export const PERMITTED_SLOTS = [
  'Morning (Fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export const createReadingSchema = z.object({
  date: z
    .string({ required_error: 'Date is required.' })
    .trim()
    .refine((val) => isValidDateString(val), {
      message: 'Please provide a valid calendar date in YYYY-MM-DD format.',
    })
    .refine((val) => !isFutureDate(val), {
      message: 'Date cannot be in the future.',
    }),
  slot: z
    .string({ required_error: 'Time slot is required.' })
    .trim()
    .refine((val) => PERMITTED_SLOTS.includes(val), {
      message: `Time slot must be one of: ${PERMITTED_SLOTS.join(', ')}.`,
    }),
  value: z
    .any()
    .refine(
      (val) => val !== undefined && val !== null && val !== '',
      { message: 'Please enter a glucose value.' }
    )
    .transform((val) => {
      // Coerce string numbers if sent as string
      if (typeof val === 'string') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    })
    .refine((val) => typeof val === 'number' && Number.isInteger(val) && val >= 40 && val <= 600, {
      message: 'Value must be between 40 and 600 mg/dl.',
    }),
});

export const updateReadingSchema = z.object({
  date: z
    .string()
    .trim()
    .refine((val) => isValidDateString(val), {
      message: 'Please provide a valid calendar date in YYYY-MM-DD format.',
    })
    .refine((val) => !isFutureDate(val), {
      message: 'Date cannot be in the future.',
    })
    .optional(),
  slot: z
    .string()
    .trim()
    .refine((val) => PERMITTED_SLOTS.includes(val), {
      message: `Time slot must be one of: ${PERMITTED_SLOTS.join(', ')}.`,
    })
    .optional(),
  value: z
    .any()
    .optional()
    .refine(
      (val) => val === undefined || (val !== null && val !== ''),
      { message: 'Please enter a glucose value.' }
    )
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === 'string') {
        const num = Number(val);
        return isNaN(num) ? val : num;
      }
      return val;
    })
    .refine(
      (val) => val === undefined || (typeof val === 'number' && Number.isInteger(val) && val >= 40 && val <= 600),
      {
        message: 'Value must be between 40 and 600 mg/dl.',
      }
    ),
});

