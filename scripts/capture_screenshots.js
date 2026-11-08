import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching headless Chrome to capture application screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  const baseUrl = 'http://127.0.0.1:5008';

  try {
    // 1. Login Page
    console.log('Capturing 01_login.png...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login.png'), fullPage: true });

    // 2. Register Page
    console.log('Capturing 02_register.png...');
    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_register.png'), fullPage: true });

    // 3. Perform Login
    console.log('Logging in as demo user...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0' });
    // Click "Fill Demo"
    const fillDemoBtn = await page.waitForSelector('button:has-text("Fill Demo"), button');
    // evaluate click on fill demo
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Fill Demo'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 500));
    // Click submit
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    // Wait for navigation to /dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // 4. Dashboard Page
    console.log('Capturing 03_dashboard.png...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_dashboard.png'), fullPage: true });

    // 5. Open Add Reading Modal
    console.log('Capturing 04_add_modal.png...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const logBtn = btns.find(b => b.textContent.includes('Log Reading') || b.textContent.includes('Add Reading'));
      if (logBtn) logBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_add_modal.png'), fullPage: true });

    // Close modal (hit Escape)
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // 6. My Readings Page
    console.log('Capturing 05_readings.png...');
    await page.goto(`${baseUrl}/readings`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_readings.png'), fullPage: true });

    // 7. Daily Report Page
    console.log('Capturing 06_daily_report.png...');
    await page.goto(`${baseUrl}/reports/daily`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_daily_report.png'), fullPage: true });

    // 8. Month to Date Report Page
    console.log('Capturing 07_mtd_report.png...');
    await page.goto(`${baseUrl}/reports/month-to-date`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_mtd_report.png'), fullPage: true });

    // 9. Previous Month Report Page
    console.log('Capturing 08_previous_month.png...');
    await page.goto(`${baseUrl}/reports/previous-month`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_previous_month.png'), fullPage: true });

    // 10. Profile & Account Page
    console.log('Capturing 09_profile.png...');
    await page.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_profile.png'), fullPage: true });

    // 11. Mobile Dashboard View (iPhone 14 / 390x844)
    console.log('Capturing 10_mobile_dashboard.png...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '10_mobile_dashboard.png'), fullPage: true });

    console.log('✓ All 10 screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
