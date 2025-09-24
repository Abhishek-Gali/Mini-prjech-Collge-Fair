// backend/scrapers/linkedin.js
const { scrapeLinkedInPublic } = require('./headless');

async function scrapeLinkedInWrapper() {
  return scrapeLinkedInPublic(['cybersecurity', 'security engineer', 'security analyst'], 2);
}

module.exports = { scrapeLinkedInWrapper };
