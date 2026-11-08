import {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} from '../services/readingService.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const reading = await createReading(req.user.id, req.body);
    return sendSuccess(res, 'Reading created successfully.', reading, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { date, page, limit } = req.query;
    const result = await getReadings(req.user.id, { date, page, limit });
    return sendSuccess(res, 'Readings retrieved successfully.', result, 200);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const reading = await getReadingById(req.user.id, req.params.id);
    return sendSuccess(res, 'Reading retrieved successfully.', reading, 200);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const reading = await updateReading(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Reading updated successfully.', reading, 200);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteReading(req.user.id, req.params.id);
    return sendSuccess(res, 'Reading deleted successfully.', {}, 200);
  } catch (err) {
    next(err);
  }
};

