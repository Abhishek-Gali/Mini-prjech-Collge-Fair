// backend/scrapers/headless.js
const { chromium } = require('playwright-extra');
const Stealth = require('puppeteer-extra-plugin-stealth')();
const randomUA = require('random-useragent');
const { setTimeout: delay } = require('timers/promises');

chromium.use(Stealth);

function pickProxy() {
  const pool = (process.env.PROXY_POOL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  return process.env.PROXY_URL || null;
}

async function launchBrowser() {
  const proxy = pickProxy();
  const headless = String(process.env.HEADLESS || 'true') === 'true';
  return chromium.launch({
    headless,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    proxy: proxy ? { server: proxy } : undefined,
  });
}

async function newPage(context) {
  const page = await context.newPage();
  const ua = randomUA.getRandom() || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  await page.setUserAgent(ua);
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'media', 'font', 'stylesheet'].includes(type)) return route.abort();
    return route.continue();
  });
  return page;
}

function dedupe(arr) {
  const set = new Set();
  const out = [];
  for (const j of arr) {
    const key = `${j.source}|${j.title}|${j.company}`;
    if (!set.has(key)) {
      set.add(key);
      out.push(j);
    }
  }
  return out;
}

async function scrapeIndeedIndia(keywords = ['cybersecurity'], pages = 1) {
  const browser = await launchBrowser();
  const context = await browser.newContext();
  const results = [];
  try {
    const page = await newPage(context);
    for (const kw of keywords) {
      for (let p = 0; p < pages; p++) {
        const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(kw)}&l=India&start=${p * 10}&sort=date`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1500);
        const jobs = await page.$$eval('.job_seen_beacon,[data-testid="job-result"]', (cards) =>
          cards
            .map((card) => {
              const titleA = card.querySelector('h2 a, [data-testid="jobTitle"] a, .jobTitle a');
              const companyEl = card.querySelector('.companyName, [data-testid="company-name"]');
              const locEl = card.querySelector('.companyLocation, [data-testid="text-location"]');
              const salaryEl = card.querySelector('.salary-snippet, [data-testid="attribute_snippet_testid"]');
              const href = titleA ? titleA.getAttribute('href') : null;
              const title = titleA ? titleA.textContent.trim() : null;
              const company = companyEl ? companyEl.textContent.trim() : null;
              const location = locEl ? locEl.textContent.trim() : 'India';
              const salary = salaryEl ? salaryEl.textContent.trim() : null;
              return title && company
                ? {
                    title,
                    company,
                    location,
                    salary,
                    url: href ? new URL(href, 'https://in.indeed.com').toString() : null,
                    source: 'indeed',
                  }
                : null;
            })
            .filter(Boolean)
        );
        results.push(...jobs);
        await delay(Number(process.env.REQUEST_DELAY_MS || 2500));
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
  return dedupe(results);
}

async function scrapeLinkedInPublic(keywords = ['cybersecurity'], scrolls = 2) {
  const browser = await launchBrowser();
  const context = await browser.newContext();
  const results = [];
  try {
    const page = await newPage(context);
    for (const kw of keywords) {
      const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(kw)}&location=India&f_TPR=r86400`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2500);
      for (let s = 0; s < scrolls; s++) {
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);
      }
      const jobs = await page.$$eval('div.jobs-search__results-list li, .jobs-search-results-list li', (cards) =>
        cards
          .map((li) => {
            const t = li.querySelector('a.job-card-list__title, a[data-tracking-control-name*="job_card_title"]');
            const c = li.querySelector('.job-card-container__company-name, .artdeco-entity-lockup__subtitle');
            const loc = li.querySelector('.job-card-container__metadata-item, .job-card-container__metadata-wrapper li');
            const href = t ? t.getAttribute('href') : null;
            const title = t ? t.textContent.trim() : null;
            const company = c ? c.textContent.trim() : null;
            const location = loc ? loc.textContent.trim() : 'India';
            return title && company
              ? {
                  title,
                  company,
                  location,
                  salary: null,
                  url: href ? new URL(href, 'https://www.linkedin.com').toString() : null,
                  source: 'linkedin',
                }
              : null;
          })
          .filter(Boolean)
      );
      results.push(...jobs);
      await delay(Number(process.env.REQUEST_DELAY_MS || 2500));
    }
  } finally {
    await context.close();
    await browser.close();
  }
  return dedupe(results);
}

module.exports = { scrapeIndeedIndia, scrapeLinkedInPublic };
