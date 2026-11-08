import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';

describe('Reports API', () => {
  let token;
  let userId;

  beforeEach(async () => {
    await prisma.reading.deleteMany();
    await prisma.user.deleteMany();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Report User',
        email: 'reportuser@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

    token = reg.body.data.token;
    userId = reg.body.data.user.id;
  });

  describe('Daily Report: GET /api/reports/daily', () => {
    it('should compute exact stats for selected date only', async () => {
      const testDate = '2026-05-15';

      // Insert 3 readings on 2026-05-15: 90, 130, 115
      // Sum = 335. Count = 3. Avg = 335/3 = 111.666... -> rounded to 111.7
      await prisma.reading.create({
        data: { userId, date: testDate, slot: 'Morning (Fasting)', value: 90 },
      });
      await prisma.reading.create({
        data: { userId, date: testDate, slot: 'After breakfast', value: 130 },
      });
      await prisma.reading.create({
        data: { userId, date: testDate, slot: 'After lunch', value: 115 },
      });

      // Also insert a reading on another date (which must NOT affect this report)
      await prisma.reading.create({
        data: { userId, date: '2026-05-16', slot: 'Morning (Fasting)', value: 200 },
      });

      const res = await request(app)
        .get(`/api/reports/daily?date=${testDate}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(3);
      expect(res.body.data.highest).toBe(130);
      expect(res.body.data.lowest).toBe(90);
      expect(res.body.data.average).toBe(111.7);
      expect(res.body.data.readings.length).toBe(3);
      expect(res.body.data.readings[0].slot).toBe('Morning (Fasting)');
    });

    it('should display required friendly message when report is empty', async () => {
      const emptyDate = '2026-06-01';
      const res = await request(app)
        .get(`/api/reports/daily?date=${emptyDate}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(0);
      expect(res.body.data.highest).toBeNull();
      expect(res.body.data.lowest).toBeNull();
      expect(res.body.data.average).toBeNull();
      expect(res.body.data.isEmpty).toBe(true);
      expect(res.body.data.emptyMessage).toBe(
        'No readings yet. Start tracking your glucose to see your health insights here.'
      );
    });
  });

  describe('Month-to-Date Report: GET /api/reports/month-to-date', () => {
    it('should evaluate date range from 1st of month through selected date', async () => {
      // Date: 2026-07-15 -> evaluates 2026-07-01 to 2026-07-15
      await prisma.reading.create({
        data: { userId, date: '2026-07-02', slot: 'Morning (Fasting)', value: 92 },
      });
      await prisma.reading.create({
        data: { userId, date: '2026-07-15', slot: 'After lunch', value: 128 },
      });
      // Reading later in the month (must be excluded)
      await prisma.reading.create({
        data: { userId, date: '2026-07-20', slot: 'Morning (Fasting)', value: 180 },
      });

      const res = await request(app)
        .get('/api/reports/month-to-date?date=2026-07-15')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.startDate).toBe('2026-07-01');
      expect(res.body.data.endDate).toBe('2026-07-15');
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.highest).toBe(128);
      expect(res.body.data.lowest).toBe(92);
      expect(res.body.data.average).toBe(110.0);
    });

    it('should display empty message if no readings exist in month-to-date range', async () => {
      const res = await request(app)
        .get('/api/reports/month-to-date?date=2026-08-10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(0);
      expect(res.body.data.isEmpty).toBe(true);
      expect(res.body.data.emptyMessage).toBe(
        'No readings yet. Start tracking your glucose to see your health insights here.'
      );
    });
  });

  describe('Monthly Report (Previous Calendar Month): GET /api/reports/monthly', () => {
    it('should evaluate the entire previous calendar month correctly', async () => {
      // Selected date: 2026-10-15 -> Previous month: 2026-09-01 to 2026-09-30
      await prisma.reading.create({
        data: { userId, date: '2026-09-05', slot: 'Morning (Fasting)', value: 94 },
      });
      await prisma.reading.create({
        data: { userId, date: '2026-09-28', slot: 'After dinner', value: 136 },
      });
      // October reading (should NOT be included)
      await prisma.reading.create({
        data: { userId, date: '2026-10-02', slot: 'Morning (Fasting)', value: 100 },
      });

      const res = await request(app)
        .get('/api/reports/monthly?date=2026-10-15')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.startDate).toBe('2026-09-01');
      expect(res.body.data.endDate).toBe('2026-09-30');
      expect(res.body.data.monthName).toBe('September');
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.highest).toBe(136);
      expect(res.body.data.lowest).toBe(94);
      expect(res.body.data.average).toBe(115.0);
    });

    it('should handle year boundary transitions (January -> previous December)', async () => {
      // Selected date: 2026-01-10 -> Previous month: 2025-12-01 to 2025-12-31
      const res = await request(app)
        .get('/api/reports/monthly?date=2026-01-10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.startDate).toBe('2025-12-01');
      expect(res.body.data.endDate).toBe('2025-12-31');
      expect(res.body.data.monthName).toBe('December');
      expect(res.body.data.year).toBe(2025);
    });

    it('should display empty message if no readings exist in previous month', async () => {
      const res = await request(app)
        .get('/api/reports/monthly?date=2026-04-10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(0);
      expect(res.body.data.isEmpty).toBe(true);
      expect(res.body.data.emptyMessage).toBe(
        'No readings yet. Start tracking your glucose to see your health insights here.'
      );
    });
  });

  describe('Concurrency & Integrity: Maximum 4 Daily Readings', () => {
    it('should never permit more than 4 readings under concurrent requests', async () => {
      const targetDate = '2026-09-12';
      const slots = [
        'Morning (Fasting)',
        'After breakfast',
        'After lunch',
        'After dinner',
        'Morning (Fasting)', // intentional duplicate slot attempt
      ];

      // Fire 5 concurrent requests simultaneously
      const results = await Promise.all(
        slots.map((slot, i) =>
          request(app)
            .post('/api/readings')
            .set('Authorization', `Bearer ${token}`)
            .send({
              date: targetDate,
              slot,
              value: 100 + i,
            })
        )
      );

      // Check how many succeeded
      const successCount = results.filter((r) => r.status === 201).length;
      expect(successCount).toBeLessThanOrEqual(4);

      // Verify the database record count for that date
      const totalInDb = await prisma.reading.count({
        where: { userId, date: targetDate },
      });
      expect(totalInDb).toBeLessThanOrEqual(4);
    });
  });
});
