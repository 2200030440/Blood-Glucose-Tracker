import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { getTodayDateString, getPreviousCalendarMonthRange } from '../src/utils/dateUtils.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sweety demo database...');

  const demoEmail = 'demo@sweety.app';
  const demoPassword = 'SweetyDemo@123';
  const demoName = 'Sweety Demo';

  // 1. Create or update Demo User (idempotent)
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: demoName,
      passwordHash,
    },
    create: {
      name: demoName,
      email: demoEmail,
      passwordHash,
    },
  });

  console.log(`✓ Demo user ready: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Prepare sample readings
  const today = getTodayDateString();
  const [currentYearStr, currentMonthStr, currentDayStr] = today.split('-');
  const currentDay = parseInt(currentDayStr, 10);

  // Previous month range
  const prevMonthInfo = getPreviousCalendarMonthRange(today);
  const prevYearStr = String(prevMonthInfo.year);
  const prevMonthStr = String(prevMonthInfo.month).padStart(2, '0');

  const sampleReadings = [
    // Today's readings (3 readings for today, leaving 1 slot open for user demo!)
    { date: today, slot: 'Morning (Fasting)', value: 92 },
    { date: today, slot: 'After breakfast', value: 128 },
    { date: today, slot: 'After lunch', value: 114 },

    // Earlier this month
    ...(currentDay > 1 ? [
      { date: `${currentYearStr}-${currentMonthStr}-01`, slot: 'Morning (Fasting)', value: 96 },
      { date: `${currentYearStr}-${currentMonthStr}-01`, slot: 'After lunch', value: 122 },
      { date: `${currentYearStr}-${currentMonthStr}-01`, slot: 'After dinner', value: 135 },
    ] : []),

    ...(currentDay > 3 ? [
      { date: `${currentYearStr}-${currentMonthStr}-03`, slot: 'Morning (Fasting)', value: 89 },
      { date: `${currentYearStr}-${currentMonthStr}-03`, slot: 'After breakfast', value: 130 },
      { date: `${currentYearStr}-${currentMonthStr}-03`, slot: 'After lunch', value: 119 },
      { date: `${currentYearStr}-${currentMonthStr}-03`, slot: 'After dinner', value: 140 },
    ] : []),

    ...(currentDay > 5 ? [
      { date: `${currentYearStr}-${currentMonthStr}-05`, slot: 'Morning (Fasting)', value: 94 },
      { date: `${currentYearStr}-${currentMonthStr}-05`, slot: 'After breakfast', value: 118 },
      { date: `${currentYearStr}-${currentMonthStr}-05`, slot: 'After dinner', value: 126 },
    ] : []),

    // Previous calendar month readings (Rich data for the Previous-Month Report!)
    { date: `${prevYearStr}-${prevMonthStr}-02`, slot: 'Morning (Fasting)', value: 95 },
    { date: `${prevYearStr}-${prevMonthStr}-02`, slot: 'After lunch', value: 132 },
    { date: `${prevYearStr}-${prevMonthStr}-05`, slot: 'Morning (Fasting)', value: 91 },
    { date: `${prevYearStr}-${prevMonthStr}-05`, slot: 'After breakfast', value: 124 },
    { date: `${prevYearStr}-${prevMonthStr}-05`, slot: 'After dinner', value: 138 },
    { date: `${prevYearStr}-${prevMonthStr}-10`, slot: 'Morning (Fasting)', value: 88 },
    { date: `${prevYearStr}-${prevMonthStr}-10`, slot: 'After lunch', value: 116 },
    { date: `${prevYearStr}-${prevMonthStr}-15`, slot: 'Morning (Fasting)', value: 98 },
    { date: `${prevYearStr}-${prevMonthStr}-15`, slot: 'After breakfast', value: 142 },
    { date: `${prevYearStr}-${prevMonthStr}-15`, slot: 'After lunch', value: 120 },
    { date: `${prevYearStr}-${prevMonthStr}-15`, slot: 'After dinner', value: 130 },
    { date: `${prevYearStr}-${prevMonthStr}-20`, slot: 'Morning (Fasting)', value: 90 },
    { date: `${prevYearStr}-${prevMonthStr}-20`, slot: 'After lunch', value: 115 },
    { date: `${prevYearStr}-${prevMonthStr}-25`, slot: 'Morning (Fasting)', value: 93 },
    { date: `${prevYearStr}-${prevMonthStr}-25`, slot: 'After breakfast', value: 127 },
    { date: `${prevYearStr}-${prevMonthStr}-28`, slot: 'Morning (Fasting)', value: 97 },
    { date: `${prevYearStr}-${prevMonthStr}-28`, slot: 'After dinner', value: 134 },
  ];

  let insertedCount = 0;
  for (const r of sampleReadings) {
    await prisma.reading.upsert({
      where: {
        userId_date_slot_unique: {
          userId: demoUser.id,
          date: r.date,
          slot: r.slot,
        },
      },
      update: {
        value: r.value,
      },
      create: {
        userId: demoUser.id,
        date: r.date,
        slot: r.slot,
        value: r.value,
      },
    });
    insertedCount++;
  }

  console.log(`✓ Seeded ${insertedCount} glucose readings for demo user.`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
