/**
 * Walk every AEP route via demo login and report page load status.
 */
import { chromium } from 'playwright';

const BASE = process.env.SITE_URL || 'http://127.0.0.1:3000';

const ROUTES = [
  { path: '/', title: 'Dashboard' },
  { path: '/repository', title: 'Test Repository' },
  { path: '/test-data', title: 'Test Data' },
  { path: '/workflows', title: 'Workflow Builder' },
  { path: '/applications', title: 'Applications' },
  { path: '/team', title: 'Team' },
  { path: '/environments', title: 'Environments' },
  { path: '/execute', title: 'Execution Center' },
  { path: '/monitor', title: 'Live Monitor' },
  { path: '/analytics', title: 'Analytics' },
  { path: '/reports', title: 'Reports' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);

  const demoBtn = page.getByRole('button', { name: /Log In as QA Lead/i });
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click();
    await page.waitForFunction(
      () => localStorage.getItem('onboarded') === 'true',
      null,
      { timeout: 5000 }
    ).catch(() => {});
    await page.waitForTimeout(2500);
    // Force reload so DataShell mounts after demo auth state
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
  }

  const onAuth = await page.getByText('Welcome back').isVisible().catch(() => false);
  if (onAuth) {
    throw new Error('Demo login failed — still on auth page');
  }

  // Dismiss seed modal if shown
  const skipSeed = page.getByRole('button', { name: /Skip for now|Skip|Close/i });
  if (await skipSeed.first().isVisible().catch(() => false)) {
    await skipSeed.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }

  await page.waitForSelector('h1.page-title', { timeout: 15000 }).catch(() => {});

  for (const route of ROUTES) {
    const entry = { ...route, ok: false, heading: '', issues: [] };
    try {
      await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);
      if (await page.getByText('Welcome back').isVisible().catch(() => false)) {
        await page.getByRole('button', { name: /Log In as QA Lead/i }).click();
        await page.waitForTimeout(2000);
        await page.goto(`${BASE}${route.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
      }
      const h1 = await page.locator('main h1.page-title, main h1').first().textContent().catch(() => '');
      entry.heading = (h1 || '').trim();
      entry.ok = entry.heading.length > 0;
      const body = await page.locator('body').innerText();
      if (/error|failed to load|undefined/i.test(body.slice(0, 500))) {
        entry.issues.push('possible error text on page');
      }
      if (body.includes('Connecting to Firestore') || body.includes('Loading workspace')) {
        entry.issues.push('stuck on loading screen');
        entry.ok = false;
      }
    } catch (err) {
      entry.issues.push(err.message.slice(0, 120));
    }
    results.push(entry);
    console.log(JSON.stringify(entry));
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
