import { Router } from 'express';
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from '../controllers/readingController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createReadingSchema,
  updateReadingSchema,
} from '../validators/readingValidator.js';

const router = Router();

// All reading endpoints require authenticated user
router.use(requireAuth);

router.post('/', validate(createReadingSchema), create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', validate(updateReadingSchema), update);
router.delete('/:id', remove);

export default router;
