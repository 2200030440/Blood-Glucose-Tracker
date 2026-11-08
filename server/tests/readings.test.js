import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { getTodayDateString } from '../src/utils/dateUtils.js';

describe('Readings Management API', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  const today = getTodayDateString();

  beforeEach(async () => {
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();

    // Register User 1
    const reg1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    user1Token = reg1.body.data.token;
    user1Id = reg1.body.data.user.id;

    // Register User 2
    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    user2Token = reg2.body.data.token;
    user2Id = reg2.body.data.user.id;
  });

  describe('Validation & Creation Rules', () => {
    it('should create a valid reading with 201', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
          value: 95,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(95);
      expect(res.body.data.slot).toBe('Morning (Fasting)');
      expect(res.body.data.date).toBe(today);
      expect(res.body.data.userId).toBe(user1Id);
    });

    it('should reject when glucose value is missing: "Please enter a glucose value."', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please enter a glucose value.');
    });

    it('should reject value below 40: "Value must be between 40 and 600 mg/dl."', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
          value: 39,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('should reject value above 600: "Value must be between 40 and 600 mg/dl."', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
          value: 601,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('should reject decimal value: "Value must be between 40 and 600 mg/dl."', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
          value: 105.5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('should reject date in the future: "Date cannot be in the future."', async () => {
      const futureDate = '2099-12-31';
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: futureDate,
          slot: 'Morning (Fasting)',
          value: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Date cannot be in the future.');
    });

    it('should reject duplicate slot on same date: "You already have an After lunch reading for this date."', async () => {
      // First After lunch reading
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'After lunch',
          value: 120,
        });

      // Second After lunch reading on same date
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'After lunch',
          value: 130,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You already have an After lunch reading for this date.');
    });

    it('should enforce maximum four readings per day: "You can add only 4 readings per day."', async () => {
      const slots = [
        'Morning (Fasting)',
        'After breakfast',
        'After lunch',
        'After dinner',
      ];

      // Add 4 readings
      for (const slot of slots) {
        const r = await request(app)
          .post('/api/readings')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            date: today,
            slot,
            value: 100,
          });
        expect(r.status).toBe(201);
      }

      // Try adding a 5th reading
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
          value: 110,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You can add only 4 readings per day.');
    });
  });

  describe('User Isolation & Security', () => {
    it('should not allow User 2 to access User 1 reading', async () => {
      // User 1 creates reading
      const createRes = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'Morning (Fasting)',
          value: 90,
        });
      const readingId = createRes.body.data.id;

      // User 2 tries to GET
      const getRes = await request(app)
        .get(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(getRes.status).toBe(404);

      // User 2 tries to PUT
      const putRes = await request(app)
        .put(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ value: 150 });

      expect(putRes.status).toBe(404);

      // User 2 tries to DELETE
      const delRes = await request(app)
        .delete(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(delRes.status).toBe(404);
    });
  });

  describe('Edit & Delete Flows', () => {
    it('should allow editing a reading without rejecting itself as duplicate', async () => {
      const createRes = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'After breakfast',
          value: 120,
        });
      const readingId = createRes.body.data.id;

      // Update value for the same slot and date
      const updateRes = await request(app)
        .put(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          value: 125,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.value).toBe(125);
      expect(updateRes.body.data.slot).toBe('After breakfast');
    });

    it('should allow deleting an existing reading', async () => {
      const createRes = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          date: today,
          slot: 'After dinner',
          value: 130,
        });
      const readingId = createRes.body.data.id;

      const delRes = await request(app)
        .delete(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Verify it is gone
      const checkRes = await request(app)
        .get(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(checkRes.status).toBe(404);
    });
  });
});

