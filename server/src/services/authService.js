import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

/**
 * Generate signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Cookie options for secure single-origin session
 */
export const getAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password using bcrypt
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Persist user
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  const token = generateToken(newUser.id);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
    token,
  };
};

/**
 * Authenticate existing user
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Verify password hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Retrieve user by ID
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

