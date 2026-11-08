import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';

describe('Authentication API', () => {
  beforeEach(async () => {
    // Reset test database
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.name).toBe('Jane Doe');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.token).toBeDefined();

      // Verify cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('sweety_token=');
    });

    it('should reject registration with duplicate email (409)', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      // Attempt duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Jane',
          email: 'duplicate@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('An account with this email already exists.');
    });

    it('should securely hash password with bcrypt', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'hashcheck@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'hashcheck@example.com' },
      });

      expect(user).toBeDefined();
      expect(user.passwordHash).not.toBe('Password123');
      expect(user.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // Valid bcrypt hash prefix
    });

    it('should reject registration when passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'mismatch@example.com',
          password: 'Password123',
          confirmPassword: 'MismatchPassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Passwords do not match.');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Wonder',
          email: 'alice@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });
    });

    it('should authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'WrongPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    it('should reject login with non-existent email (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password.');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Builder',
          email: 'bob@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('bob@example.com');
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Authentication required. Please log in.');
    });
  });
});
