const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const chromeCandidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Users\\MOHAMED\\.cache\\puppeteer\\chrome\\win64-150.0.7871.24\\chrome-win64\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);

  const executablePath = chromeCandidates.find((p) => fs.existsSync(p));
  if (!executablePath) {
    throw new Error('Chrome executable not found. Install it and rerun the script.');
  }

  const browser = await puppeteer.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('API RESPONSE:', response.url(), response.status());
    }
  });

  console.log('Opening login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  await page.waitForSelector('input[type="email"]');
  await page.waitForSelector('input[type="password"]');

  await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('div'));
    const roleOption = candidates.find((el) => el.textContent && el.textContent.includes('Admin'));
    if (roleOption) {
      roleOption.click();
    }
  });
  console.log('Selected admin role');

  await page.type('input[type="email"]', 'admin@mealbridge.com');
  await page.type('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  console.log('Navigated to', page.url());

  await browser.close();
})();
