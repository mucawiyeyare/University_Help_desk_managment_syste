const puppeteer = require('puppeteer');
const path = require('path');

const OUT = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\cf098a8f-d29a-41cc-9c65-fb794c103df2';
const BASE = 'http://localhost:5174';

const delay = ms => new Promise(r => setTimeout(r, ms));

async function ss(page, name, note) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log(`✅ [${note}] -> ${name}`);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('🔐 Navigating to Login page...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');

  // Triple click email and clear
  await page.click('input[type="email"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="email"]', 'admin@uhdms.edu', { delay: 30 });
  await delay(200);

  // Triple click password and clear
  await page.click('input[type="password"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="password"]', 'Admin@123456', { delay: 30 });
  await delay(400);

  await ss(page, 'admin_00_login_typed.png', 'Admin Login Typed');

  // Click Submit
  await page.click('button[type="submit"]');
  await delay(3500);

  console.log('📍 Current URL after login:', page.url());
  await ss(page, 'admin_01_dashboard.png', 'Admin Dashboard');

  // SPA Navigate to Admin Tickets
  console.log('📸 2. Admin Tickets (SPA Click)');
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => x.href.includes('/admin/tickets'));
    if (a) a.click();
  });
  await delay(2500);
  await ss(page, 'admin_02_tickets_crud.png', 'Admin Tickets CRUD');

  // SPA Navigate to SLA Policies
  console.log('📸 3. SLA Policies (SPA Click)');
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => x.href.includes('/admin/sla'));
    if (a) a.click();
  });
  await delay(2500);
  await ss(page, 'admin_03_sla_policies.png', 'SLA Policies');

  // SPA Navigate to Reports
  console.log('📸 4. Reports (SPA Click)');
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => x.href.includes('/admin/reports'));
    if (a) a.click();
  });
  await delay(2500);
  await ss(page, 'admin_04_reports.png', 'Admin Reports');

  // SPA Navigate to User Feedback
  console.log('📸 5. User Feedback (SPA Click)');
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => x.href.includes('/admin/feedback'));
    if (a) a.click();
  });
  await delay(2500);
  await ss(page, 'admin_05_feedback.png', 'User Feedback');

  // SPA Navigate to Notifications
  console.log('📸 6. Notifications (SPA Click)');
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => x.href.includes('/notifications'));
    if (a) a.click();
  });
  await delay(2500);
  await ss(page, 'admin_06_notifications.png', 'Notifications');

  // SPA Navigate to System Settings
  console.log('📸 7. System Settings (SPA Click)');
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(x => x.href.includes('/admin/settings'));
    if (a) a.click();
  });
  await delay(2500);
  await ss(page, 'admin_07_settings.png', 'System Settings');

  console.log('\n🎉 ALL ADMIN PAGES CAPTURED SUCCESSFULLY!');
  await delay(1000);
  await browser.close();
})();
