// backend/scrapers/indeed.js
const { scrapeIndeedIndia } = require('./headless');

async function scrapeIndeedWrapper() {
  return scrapeIndeedIndia(['cybersecurity', 'information security', 'security analyst'], 2);
}

module.exports = { scrapeIndeedWrapper };
