// backend/scrapers/naukri.js
const axios = require('axios');
const cheerio = require('cheerio');

function extract(listingText) {
  const skills = [];
  const kws = ['SIEM', 'Python', 'AWS', 'Azure', 'Linux', 'Network', 'Incident', 'GRC', 'Penetration', 'NIST', 'ISO'];
  const t = listingText.toLowerCase();
  for (const k of kws) if (t.includes(k.toLowerCase())) skills.push(k);
  return [...new Set(skills)].slice(0, 8);
}

async function search(keyword = 'cybersecurity', page = 1) {
  const url = `https://www.naukri.com/${encodeURIComponent(keyword)}-jobs?k=${encodeURIComponent(keyword)}&l=India&p=${page}`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Accept: 'text/html,application/xhtml+xml',
    },
    timeout: 20000,
  });
  const $ = cheerio.load(res.data);
  const out = [];
  $('article.jobTuple').each((_, el) => {
    const titleA = $(el).find('a.title').first();
    const title = titleA.text().trim();
    const href = titleA.attr('href');
    const company = $(el).find('a.comp-name').first().text().trim() || 'Unknown';
    const location = $(el).find('.locationsContainer').first().text().trim() || 'India';
    const salary = $(el).find('span.salary').first().text().trim() || null;
    const exp = $(el).find('span.exp').first().text().trim() || null;
    const text = $(el).text();
    if (title && company) {
      out.push({
        title,
        company,
        location,
        salary,
        experience: exp,
        description: text.slice(0, 400),
        skills: extract(text),
        source: 'naukri',
        url: href ? new URL(href, 'https://www.naukri.com').toString() : null,
      });
    }
  });
  return out;
}

async function scrapeNaukri(keywords = ['cybersecurity', 'information security'], pages = 2, delayMs = 1500) {
  const all = [];
  for (const kw of keywords) {
    for (let p = 1; p <= pages; p++) {
      try {
        const chunk = await search(kw, p);
        if (!chunk.length) break;
        all.push(...chunk);
        await new Promise((r) => setTimeout(r, delayMs));
      } catch (e) {
        // continue on error
      }
    }
  }
  // de-dup
  const set = new Set();
  const out = [];
  for (const j of all) {
    const k = `${j.source}|${j.title}|${j.company}`;
    if (!set.has(k)) {
      set.add(k);
      out.push(j);
    }
  }
  return out;
}

module.exports = { scrapeNaukri };
