/**
 * Cybersecurity Jobs Backend - Unified Server
 * ------------------------------------------------------------
 * - Express REST API with MongoDB persistence
 * - Legacy HTTP (axios + cheerio) scrapers for Naukri/Indeed/LinkedIn
 * - Optional Headless (Playwright Extra + Stealth) scrapers via USE_HEADLESS
 * - Clean CORS for local frontend
 * - Scheduler to refresh every 4 hours
 * - Safe, deduped save logic
 * - Robust logging and graceful fallbacks
 *
 * Environment (.env):
 *   MONGODB_URI=mongodb+srv://...
 *   PORT=5000
 *   NODE_ENV=development
 *   USE_HEADLESS=true|false
 *   PROXY_URL=http://user:pass@host:port
 *   PROXY_POOL=http://user:pass@h1:port,http://user:pass@h2:port
 *   HEADLESS=true
 *   REQUEST_DELAY_MS=2500
 */

//
// 0) Core imports (declared ONCE)
//
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');

//
// 1) Optional headless stack (loaded only if needed)
//
let playwrightExtra, stealthPlugin, randomUA, delayTimer;
const USE_HEADLESS = String(process.env.USE_HEADLESS || 'false').toLowerCase() === 'true';
if (USE_HEADLESS) {
  try {
    playwrightExtra = require('playwright-extra');
    stealthPlugin = require('puppeteer-extra-plugin-stealth')();
    randomUA = require('random-useragent');
    delayTimer = require('timers/promises').setTimeout;
    playwrightExtra.use(stealthPlugin);
  } catch (e) {
    console.warn('[WARN] USE_HEADLESS=true but headless deps not installed; falling back to legacy HTTP scrapers.');
  }
}

//
// 2) App init
//
const app = express();
const PORT = process.env.PORT || 5000;

app.disable('etag');
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });


// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
  credentials: false
}));
app.use(express.json());

//
// 3) MongoDB (one connection, one import)
//
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersecurity_jobs';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('[DB] Connected to MongoDB'))
  .catch(err => console.error('[DB] MongoDB connection error:', err));

// Model (external file optional; inline fallback provided)
let Job;
try {
  Job = require('./models/Job'); // if you created models/Job.js
} catch {
  const jobSchema = new mongoose.Schema({
    jobId: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, default: 'India' },
    salary: { type: String, default: null },
    experience: { type: String, default: null },
    description: { type: String, default: '' },
    skills: { type: [String], default: [] },
    source: { type: String, enum: ['linkedin', 'indeed', 'naukri', 'seed'], required: true, index: true },
    url: { type: String, default: null },
    postedDate: { type: Date, default: Date.now },
    scrapedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }, { timestamps: true });
  Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
}

//
// 4) Utilities: logging, dedupe, skill extraction, filters
//
const LOG = {
  info: (...a) => console.log('[INFO ]', new Date().toISOString(), ...a),
  warn: (...a) => console.warn('[WARN ]', new Date().toISOString(), ...a),
  error: (...a) => console.error('[ERROR]', new Date().toISOString(), ...a),
  debug: (...a) => console.log('[DEBUG]', new Date().toISOString(), ...a),
};

function dedupeJobs(arr) {
  const set = new Set();
  const out = [];
  for (const j of arr) {
    const key = `${(j.source || '').toLowerCase()}|${(j.title || '').toLowerCase()}|${(j.company || '').toLowerCase()}`;
    if (!set.has(key)) {
      set.add(key);
      out.push(j);
    }
  }
  return out;
}

function isCybersecurityRelated(title = '') {
  const keywords = [
    'cyber', 'security', 'analyst', 'engineer', 'architect', 'consultant',
    'penetration', 'testing', 'ethical', 'hacker', 'information', 'risk',
    'compliance', 'audit', 'soc', 'siem', 'incident', 'response', 'forensics',
    'vulnerability', 'assessment', 'grc', 'devsecops', 'cloud security',
    'network security', 'application security', 'infosec'
  ];
  const t = String(title).toLowerCase();
  return keywords.some(k => t.includes(k));
}

function extractSkills(textOrTitle = '') {
  const skillKeywords = [
    'SIEM', 'CISSP', 'CEH', 'CISA', 'CISM', 'AWS', 'Azure', 'Python',
    'Splunk', 'QRadar', 'Nessus', 'Metasploit', 'Burp Suite', 'Wireshark',
    'Firewall', 'IDS/IPS', 'PKI', 'LDAP', 'Active Directory', 'SOX',
    'PCI DSS', 'ISO 27001', 'NIST', 'OWASP', 'Penetration Testing',
    'Vulnerability Assessment', 'Incident Response', 'Forensics'
  ];
  const T = String(textOrTitle).toUpperCase();
  return skillKeywords.filter(s => T.includes(s.toUpperCase())).slice(0, 12);
}

//
// 5) Legacy HTTP scrapers (axios + cheerio)
//    These remain for parity and as fallback when headless is off or blocked.
//
class LegacyScraper {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36'
    ];
  }
  ua() { return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]; }
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async scrapeLinkedIn() {
    LOG.info('Legacy: Scraping LinkedIn (guest endpoints)…');
    const urls = [
      'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=cybersecurity&location=India&start=0',
      'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=information%20security&location=India&start=0',
      'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=security%20analyst&location=India&start=0',
      'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=security%20engineer&location=India&start=0'
    ];
    const out = [];
    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: {
            'User-Agent': this.ua(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 15000
        });
        const $ = cheerio.load(res.data);
        $('li').each((_, el) => {
          const titleEl = $(el).find('h3 a, .job-title a, [data-testid="job-title"]');
          const companyEl = $(el).find('h4 a, .job-company a, [data-testid="job-company"]');
          const locationEl = $(el).find('.job-location, [data-testid="job-location"]');
          const linkEl = $(el).find('a[href*="/jobs/view/"]');
          const title = titleEl.text().trim();
          const company = companyEl.text().trim();
          const location = (locationEl.text().trim() || 'India');
          const href = linkEl.attr('href');
          if (title && company && isCybersecurityRelated(title)) {
            out.push({
              jobId: `linkedin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              title, company, location,
              source: 'linkedin',
              url: href ? `https://www.linkedin.com${href}` : null,
              postedDate: new Date(),
              skills: extractSkills(title),
              description: title
            });
          }
        });
        await this.sleep(2000);
      } catch (e) {
        LOG.warn('Legacy LinkedIn error:', e.message);
      }
    }
    return out;
  }

  async scrapeIndeed() {
    LOG.info('Legacy: Scraping Indeed…');
    const urls = [
      'https://in.indeed.com/jobs?q=cybersecurity&l=India',
      'https://in.indeed.com/jobs?q=information+security&l=India',
      'https://in.indeed.com/jobs?q=security+analyst&l=India',
      'https://in.indeed.com/jobs?q=penetration+testing&l=India'
    ];
    const out = [];
    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: {
            'User-Agent': this.ua(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 15000
        });
        const $ = cheerio.load(res.data);
        $('.job_seen_beacon, .jobsearch-SerpJobCard, [data-testid="job-result"]').each((_, el) => {
          const titleA = $(el).find('h2 a, .jobTitle a, [data-testid="job-title"] a');
          const companyEl = $(el).find('.companyName a, [data-testid="company-name"] a, .companyName span');
          const locationEl = $(el).find('[data-testid="job-location"], .companyLocation');
          const salaryEl = $(el).find('.salary-snippet, [data-testid="job-salary"]');
          const title = titleA.text().trim();
          const company = companyEl.text().trim();
          const location = (locationEl.text().trim() || 'India');
          const salary = salaryEl.text().trim() || null;
          const href = titleA.attr('href');
          if (title && company && isCybersecurityRelated(title)) {
            out.push({
              jobId: `indeed_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              title, company, location,
              salary, source: 'indeed',
              url: href ? `https://in.indeed.com${href}` : null,
              postedDate: new Date(),
              skills: extractSkills(title),
              description: title
            });
          }
        });
        await this.sleep(2000);
      } catch (e) {
        LOG.warn('Legacy Indeed error:', e.message);
      }
    }
    return out;
  }

  async scrapeNaukri() {
    LOG.info('Legacy: Scraping Naukri…');
    const urls = [
      'https://www.naukri.com/cybersecurity-jobs',
      'https://www.naukri.com/information-security-jobs',
      'https://www.naukri.com/security-analyst-jobs',
      'https://www.naukri.com/penetration-testing-jobs'
    ];
    const out = [];
    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: {
            'User-Agent': this.ua(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 15000
        });
        const $ = cheerio.load(res.data);
        $('.jobTuple, .jobTupleHeader, .srp-jobtuple').each((_, el) => {
          const titleEl = $(el).find('.title a, .jobTitle a, .jobTitle');
          const companyEl = $(el).find('.subTitle a, .companyName a, .companyName');
          const locationEl = $(el).find('.locationsContainer, .location');
          const salaryEl = $(el).find('.salary, .packageContainer');
          const expEl = $(el).find('.experience, .expwdth');

          const title = titleEl.text().trim();
          const company = companyEl.text().trim();
          const location = (locationEl.text().trim() || 'India');
          const salary = salaryEl.text().trim() || null;
          const experience = expEl.text().trim() || null;
          const href = titleEl.attr('href');

          if (title && company && isCybersecurityRelated(title)) {
            out.push({
              jobId: `naukri_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              title, company, location, salary, experience,
              source: 'naukri',
              url: href ? `https://www.naukri.com${href}` : null,
              postedDate: new Date(),
              skills: extractSkills(title),
              description: title
            });
          }
        });
        await this.sleep(2000);
      } catch (e) {
        LOG.warn('Legacy Naukri error:', e.message);
      }
    }
    return out;
  }
}

//
// 6) Headless scrapers (Playwright Extra + Stealth) – optional
//
async function pickProxyFromEnv() {
  const pool = (process.env.PROXY_POOL || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  return process.env.PROXY_URL || null;
}

async function withBrowser(fn) {
  if (!USE_HEADLESS || !playwrightExtra) throw new Error('Headless stack not available');
  const proxyServer = await pickProxyFromEnv();
  const headless = String(process.env.HEADLESS || 'true') === 'true';
  const chromium = playwrightExtra.chromium;

  const ua = (randomUA && randomUA.getRandom) ? randomUA.getRandom()
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

  const browser = await chromium.launch({
    headless,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    proxy: proxyServer ? { server: proxyServer } : undefined
  });

  const context = await browser.newContext({ userAgent: ua });
  const page = await context.newPage();

  await page.route('**/*', route => {
    const t = route.request().resourceType();
    if (['image','font','media','stylesheet'].includes(t)) return route.abort();
    return route.continue();
  });

  try { return await fn(page, context); }
  finally { await context.close(); await browser.close(); }
}

async function headlessScrapeIndeed() {
  if (!USE_HEADLESS || !playwrightExtra) return [];
  LOG.info('Headless: Scraping Indeed with Playwright…');
  const delayMs = Number(process.env.REQUEST_DELAY_MS || 2500);
  return withBrowser(async (page) => {
    const results = [];
    const keywords = ['cybersecurity', 'information security'];
    for (const kw of keywords) {
      for (let p = 0; p < 2; p++) {
        const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(kw)}&l=India&start=${p * 10}&sort=date`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1500);
        const jobs = await page.$$eval('.job_seen_beacon,[data-testid="job-result"]', cards => cards.map(card => {
          const tA = card.querySelector('h2 a, [data-testid="jobTitle"] a, .jobTitle a');
          const cEl = card.querySelector('.companyName, [data-testid="company-name"]');
          const lEl = card.querySelector('.companyLocation, [data-testid="text-location"]');
          const sEl = card.querySelector('.salary-snippet, [data-testid="attribute_snippet_testid"]');
          const href = tA ? tA.getAttribute('href') : null;
          const title = tA ? tA.textContent.trim() : null;
          const company = cEl ? cEl.textContent.trim() : null;
          const location = lEl ? lEl.textContent.trim() : 'India';
          const salary = sEl ? sEl.textContent.trim() : null;
          if (title && company) {
            return {
              title, company, location, salary,
              source: 'indeed',
              url: href ? new URL(href, 'https://in.indeed.com').toString() : null
            };
          }
          return null;
        }).filter(Boolean));
        results.push(...jobs);
        if (delayTimer) await delayTimer(delayMs);
      }
    }
    // normalize for DB
    return results.map(j => ({
      jobId: `indeed_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
      ...j,
      postedDate: new Date(),
      scrapedAt: new Date(),
      description: j.title,
      skills: extractSkills(j.title),
    }));
  });
}

async function headlessScrapeLinkedIn() {
  if (!USE_HEADLESS || !playwrightExtra) return [];
  LOG.info('Headless: Scraping LinkedIn with Playwright…');
  const delayMs = Number(process.env.REQUEST_DELAY_MS || 2500);
  return withBrowser(async (page) => {
    const results = [];
    const keywords = ['cybersecurity', 'security engineer'];
    for (const kw of keywords) {
      const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(kw)}&location=India&f_TPR=r86400`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
      }
      const jobs = await page.$$eval('div.jobs-search__results-list li, .jobs-search-results-list li', cards => cards.map(li => {
        const t = li.querySelector('a.job-card-list__title, a[data-tracking-control-name*="job_card_title"]');
        const c = li.querySelector('.job-card-container__company-name, .artdeco-entity-lockup__subtitle');
        const loc = li.querySelector('.job-card-container__metadata-item, .job-card-container__metadata-wrapper li');
        const href = t ? t.getAttribute('href') : null;
        const title = t ? t.textContent.trim() : null;
        const company = c ? c.textContent.trim() : null;
        const location = loc ? loc.textContent.trim() : 'India';
        if (title && company) {
          return {
            title, company, location, salary: null,
            source: 'linkedin',
            url: href ? new URL(href, 'https://www.linkedin.com').toString() : null
          };
        }
        return null;
      }).filter(Boolean));
      results.push(...jobs);
      if (delayTimer) await delayTimer(delayMs);
    }
    return results.map(j => ({
      jobId: `linkedin_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
      ...j,
      postedDate: new Date(),
      scrapedAt: new Date(),
      description: j.title,
      skills: extractSkills(j.title),
    }));
  });
}

//
// 7) Aggregation: choose headless or legacy per source
const legacy = new LegacyScraper();

async function aggregateScrape(sourceOverride = '') {
  LOG.info(`Scraping mode: ${USE_HEADLESS && playwrightExtra ? 'HEADLESS' : 'LEGACY'}`);
  const src = String(sourceOverride || '').toLowerCase();  // 'linkedin' | 'indeed' | 'naukri' | ''
  const tasks = [];
  const want = (s) => !src || src === s;

  if (want('naukri')) tasks.push(legacy.scrapeNaukri());
  if (want('indeed')) tasks.push(USE_HEADLESS && playwrightExtra ? headlessScrapeIndeed() : legacy.scrapeIndeed());
  if (want('linkedin')) tasks.push(USE_HEADLESS && playwrightExtra ? headlessScrapeLinkedIn() : legacy.scrapeLinkedIn());

  const settled = await Promise.allSettled(tasks);
  const all = [];
  for (const s of settled) {
    if (s.status === 'fulfilled') all.push(...s.value);
    else LOG.warn('Scraper failed:', s.reason?.message || s.reason);
  }
  return dedupeJobs(all);
}

//
// 8) Persistence helpers
//

async function saveJobsToDatabase(jobs = [], opts = {}) {
  const mode = (opts.mode || '').toLowerCase(); // '', 'upsert'
  const source = (opts.source || '').toLowerCase();
  let saved = 0, updated = 0;

  for (const data of jobs) {
    try {
      if (!data.title || !data.company) continue;
      if (!data.source) data.source = source || data.source || 'unknown';
      if (!data.jobId) {
        data.jobId = `${data.source}_${(data.title||'').toLowerCase().slice(0,60).replace(/[^a-z0-9]+/g,'-')}_${(data.company||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
      }
      const now = new Date();
      data.scrapedAt = now;
      if (!data.postedDate) data.postedDate = now;

      const match = mode === 'upsert'
        ? { source: data.source,
            title: new RegExp(`^${data.title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}$`, 'i'),
            company: new RegExp(`^${data.company.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}$`, 'i') }
        : { jobId: data.jobId };

      const existing = await Job.findOne(match);

      if (!existing) {
        await new Job(data).save();
        saved++;
      } else {
        const updateDoc = {
          location: data.location || existing.location,
          salary: data.salary || existing.salary,
          experience: data.experience || existing.experience,
          description: data.description || existing.description,
          skills: data.skills?.length ? Array.from(new Set([...(existing.skills || []), ...data.skills])) : existing.skills,
          url: data.url || existing.url,
          postedDate: data.postedDate || existing.postedDate,
          scrapedAt: now,
          isActive: true
        };
        await Job.updateOne({ _id: existing._id }, updateDoc);
        updated++;
      }
    } catch (e) {
      LOG.error('Save error:', e.message);
    }
  }

  LOG.info(`Saved ${saved} new, updated ${updated} jobs (mode=${mode || 'default'})`);
  return { saved, updated, mode: mode || 'default' };
}


//
// 9) API routes
//
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() });
});



const escapeRegExp = (s='') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.get('/api/jobs', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const search = String(req.query.search || '').trim();
    const source = String(req.query.source || '').trim(); // linkedin|indeed|naukri

    const filter = { isActive: true };
    if (source) filter.source = new RegExp(`^${escapeRegExp(source)}$`, 'i');
    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills:  { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ postedDate: -1, scrapedAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter)
    ]);

    res.set('Cache-Control', 'no-store');
    res.json({ jobs, page, total });
  } catch (e) {
    LOG.error('GET /api/jobs error:', e.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});


app.get('/api/stats', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const jobsBySource = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const topCompanies = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]);
    const topSkills = await Job.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 20 }
    ]);
    res.json({ totalJobs, jobsBySource, topCompanies, topSkills, lastUpdated: new Date() });
  } catch (e) {
    LOG.error('GET /api/stats error:', e.message);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.post('/api/scrape', async (req, res) => {
  try {
    const source = (req.query.source || '').toLowerCase();       // linkedin | indeed | naukri | ''
    const mode = (req.query.mode || '').toLowerCase();           // '', 'upsert', 'purge'
    LOG.info('Manual scrape triggered', source ? `for ${source}` : '(all)', mode ? `mode=${mode}` : '');

    if (mode === 'purge' && source) {
      const del = await Job.deleteMany({ source });
      LOG.warn(`Purged ${del.deletedCount} jobs for source=${source}`);
    }

    const jobs = await aggregateScrape(source);
    const result = await saveJobsToDatabase(jobs, { mode, source });
    res.json({ message: 'Scraping completed', source: source || 'all', mode: mode || 'default', jobsFound: jobs.length, ...result });
  } catch (e) {
    LOG.error('POST /api/scrape error:', e.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});


//
// 10) Optional static serving (if you later build a frontend into backend/public)
//
/*
// If you choose to serve the Frontend via Express, uncomment:
// app.use(express.static(path.join(__dirname, 'public')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });
*/

//
// 11) Scheduler: run every 4 hours
//
cron.schedule('0 */4 * * *', async () => {
  LOG.info('Scheduled scraping started…');
  try {
    const jobs = await aggregateScrape();
    await saveJobsToDatabase(jobs);
    LOG.info('Scheduled scraping completed');
  } catch (e) {
    LOG.error('Scheduled scraping failed:', e.message);
  }
});

//
// 12) Start server + initial scrape
//
app.listen(PORT, () => {
  LOG.info(`Server is running on port ${PORT}`);
  LOG.info(`MongoDB URI: ${MONGODB_URI}`);
  setTimeout(async () => {
    try {
      LOG.info('Initial scraping…');
      const jobs = await aggregateScrape();
      await saveJobsToDatabase(jobs);
      LOG.info('Initial scraping completed');
    } catch (e) {
      LOG.error('Initial scraping error:', e.message);
    }
  }, 5000);
});

module.exports = app;
