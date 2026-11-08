import { registerUser, loginUser, getAuthCookieOptions } from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUser({ name, email, password });

    res.cookie('sweety_token', token, getAuthCookieOptions());

    return sendSuccess(
      res,
      'Registration successful. Welcome to Sweety!',
      { user, token },
      201
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });

    res.cookie('sweety_token', token, getAuthCookieOptions());

    return sendSuccess(
      res,
      'Login successful. Welcome back!',
      { user, token },
      200
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('sweety_token', {
      httpOnly: true,
      path: '/',
    });

    return sendSuccess(res, 'Logged out successfully.', {}, 200);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User profile retrieved.', { user: req.user }, 200);
  } catch (err) {
    next(err);
  }
};
