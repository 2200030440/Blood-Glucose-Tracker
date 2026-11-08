import { Router } from 'express';
import {
  daily,
  monthToDate,
  monthly,
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportQuerySchema } from '../validators/reportValidator.js';

const router = Router();

// All report endpoints require authenticated user
router.use(requireAuth);

router.get('/daily', validate(reportQuerySchema, 'query'), daily);
router.get('/month-to-date', validate(reportQuerySchema, 'query'), monthToDate);
router.get('/monthly', validate(reportQuerySchema, 'query'), monthly);

export default router;

