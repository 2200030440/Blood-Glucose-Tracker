import {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
} from '../services/reportService.js';
import { sendSuccess } from '../utils/response.js';

export const daily = async (req, res, next) => {
  try {
    const report = await getDailyReport(req.user.id, req.query.date);
    return sendSuccess(res, 'Daily report generated successfully.', report, 200);
  } catch (err) {
    next(err);
  }
};

export const monthToDate = async (req, res, next) => {
  try {
    const report = await getMonthToDateReport(req.user.id, req.query.date);
    return sendSuccess(res, 'Month-to-date report generated successfully.', report, 200);
  } catch (err) {
    next(err);
  }
};

export const monthly = async (req, res, next) => {
  try {
    const report = await getMonthlyReport(req.user.id, req.query.date);
    return sendSuccess(res, 'Monthly report generated successfully.', report, 200);
  } catch (err) {
    next(err);
  }
};

