const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape LinkedIn jobs using the hidden guest API endpoint
 * No login required, bypasses ERR_CONNECTION_RESET
 */
async function scrapeLinkedInJobs() {
  const jobs = [];
  const keywords = ['cybersecurity', 'security engineer', 'security analyst', 'penetration tester'];
  const location = 'India';
  const BASE_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
  
  // User agent to mimic real browser
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  for (const keyword of keywords) {
    try {
      console.log(`[LinkedIn] Scraping keyword: ${keyword}`);
      
      // LinkedIn guest API returns HTML with job cards
      // Paginate through results (25 jobs per page)
      for (let page = 0; page < 2; page++) {
        const start = page * 25;
        const url = `${BASE_URL}?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&start=${start}`;
        
        // Add delay between requests to avoid rate limiting
        if (page > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        }

        const response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.linkedin.com/jobs/search',
          },
          timeout: 30000,
        });

        const $ = cheerio.load(response.data);

        // Parse job cards from the HTML response
        $('li').each((_, element) => {
          const $card = $(element);
          
          const titleEl = $card.find('.base-search-card__title, h3.base-search-card__title');
          const companyEl = $card.find('.base-search-card__subtitle, h4.base-search-card__subtitle');
          const locationEl = $card.find('.job-search-card__location');
          const linkEl = $card.find('a.base-card__full-link');
          const dateEl = $card.find('time');

          const title = titleEl.text().trim();
          const company = companyEl.text().trim();
          const jobLocation = locationEl.text().trim() || location;
          const link = linkEl.attr('href');
          const postedDate = dateEl.attr('datetime') || new Date().toISOString();

          if (title && company && link) {
            jobs.push({
              jobId: `linkedin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              title,
              company,
              location: jobLocation,
              salary: null,
              experience: null,
              description: title,
              skills: extractSkills(title),
              source: 'linkedin',
              url: link.startsWith('http') ? link : `https://www.linkedin.com${link}`,
              postedDate: new Date(postedDate),
              scrapedAt: new Date(),
              isActive: true,
            });
          }
        });

        console.log(`[LinkedIn] Page ${page + 1} scraped for "${keyword}"`);
      }

    } catch (error) {
      console.error(`[LinkedIn] Error scraping "${keyword}":`, error.message);
    }
  }

  console.log(`[LinkedIn] Total jobs scraped: ${jobs.length}`);
  return jobs;
}

/**
 * Extract cybersecurity skills from job title or description
 */
function extractSkills(text) {
  const skillKeywords = [
    'SIEM', 'CISSP', 'CEH', 'CISA', 'CISM', 'AWS', 'Azure', 'Python',
    'Splunk', 'QRadar', 'Nessus', 'Metasploit', 'Burp Suite', 'Wireshark',
    'Firewall', 'IDS/IPS', 'PKI', 'LDAP', 'Active Directory', 'SOX',
    'PCI DSS', 'ISO 27001', 'NIST', 'OWASP', 'Penetration Testing',
    'Vulnerability Assessment', 'Incident Response', 'Forensics'
  ];
  
  const upperText = String(text).toUpperCase();
  return skillKeywords.filter(skill => upperText.includes(skill.toUpperCase())).slice(0, 12);
}

module.exports = scrapeLinkedInJobs;
