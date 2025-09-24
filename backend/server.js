const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersecurity_jobs';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Job Schema
const jobSchema = new mongoose.Schema({
    jobId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: String,
    experience: String,
    description: String,
    skills: [String],
    source: { type: String, enum: ['linkedin', 'indeed', 'naukri'], required: true },
    url: String,
    postedDate: Date,
    scrapedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const Job = mongoose.model('Job', jobSchema);

// Scraping utilities
class JobScraper {
    constructor() {
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async scrapeLinkedInJobs() {
        console.log('Scraping LinkedIn jobs...');
        const jobs = [];
        
        try {
            // LinkedIn job search URLs for cybersecurity jobs in India
            const searchUrls = [
                'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=cybersecurity&location=India&start=0',
                'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=information%20security&location=India&start=0',
                'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=security%20analyst&location=India&start=0',
                'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=security%20engineer&location=India&start=0'
            ];

            for (const url of searchUrls) {
                try {
                    const response = await axios.get(url, {
                        headers: {
                            'User-Agent': this.getRandomUserAgent(),
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate',
                            'DNT': '1',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                        },
                        timeout: 10000
                    });

                    const $ = cheerio.load(response.data);
                    
                    $('li').each((index, element) => {
                        const jobElement = $(element);
                        const titleElement = jobElement.find('h3 a, .job-title a, [data-testid="job-title"]');
                        const companyElement = jobElement.find('h4 a, .job-company a, [data-testid="job-company"]');
                        const locationElement = jobElement.find('.job-location, [data-testid="job-location"]');
                        const linkElement = jobElement.find('a[href*="/jobs/view/"]');

                        if (titleElement.length && companyElement.length) {
                            const title = titleElement.text().trim();
                            const company = companyElement.text().trim();
                            const location = locationElement.text().trim() || 'India';
                            const jobUrl = linkElement.attr('href');
                            
                            if (title && company && this.isCybersecurityRelated(title)) {
                                jobs.push({
                                    jobId: `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    title,
                                    company,
                                    location,
                                    source: 'linkedin',
                                    url: jobUrl ? `https://www.linkedin.com${jobUrl}` : null,
                                    postedDate: new Date(),
                                    skills: this.extractSkills(title),
                                    description: title
                                });
                            }
                        }
                    });

                    await this.delay(2000); // Respectful delay
                } catch (error) {
                    console.error(`Error scraping LinkedIn URL ${url}:`, error.message);
                }
            }
        } catch (error) {
            console.error('LinkedIn scraping error:', error.message);
        }

        return jobs;
    }

    async scrapeIndeedJobs() {
        console.log('Scraping Indeed jobs...');
        const jobs = [];
        
        try {
            const searchUrls = [
                'https://in.indeed.com/jobs?q=cybersecurity&l=India',
                'https://in.indeed.com/jobs?q=information+security&l=India',
                'https://in.indeed.com/jobs?q=security+analyst&l=India',
                'https://in.indeed.com/jobs?q=penetration+testing&l=India'
            ];

            for (const url of searchUrls) {
                try {
                    const response = await axios.get(url, {
                        headers: {
                            'User-Agent': this.getRandomUserAgent(),
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5'
                        },
                        timeout: 10000
                    });

                    const $ = cheerio.load(response.data);
                    
                    $('.job_seen_beacon, .jobsearch-SerpJobCard, [data-testid="job-result"]').each((index, element) => {
                        const jobElement = $(element);
                        const titleElement = jobElement.find('h2 a, .jobTitle a, [data-testid="job-title"] a');
                        const companyElement = jobElement.find('.companyName a, [data-testid="company-name"] a, .companyName span');
                        const locationElement = jobElement.find('[data-testid="job-location"], .companyLocation');
                        const salaryElement = jobElement.find('.salary-snippet, [data-testid="job-salary"]');

                        if (titleElement.length && companyElement.length) {
                            const title = titleElement.text().trim();
                            const company = companyElement.text().trim();
                            const location = locationElement.text().trim() || 'India';
                            const salary = salaryElement.text().trim();
                            const jobUrl = titleElement.attr('href');
                            
                            if (title && company && this.isCybersecurityRelated(title)) {
                                jobs.push({
                                    jobId: `indeed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    title,
                                    company,
                                    location,
                                    salary: salary || null,
                                    source: 'indeed',
                                    url: jobUrl ? `https://in.indeed.com${jobUrl}` : null,
                                    postedDate: new Date(),
                                    skills: this.extractSkills(title),
                                    description: title
                                });
                            }
                        }
                    });

                    await this.delay(2000);
                } catch (error) {
                    console.error(`Error scraping Indeed URL ${url}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Indeed scraping error:', error.message);
        }

        return jobs;
    }

    async scrapeNaukriJobs() {
        console.log('Scraping Naukri jobs...');
        const jobs = [];
        
        try {
            const searchUrls = [
                'https://www.naukri.com/cybersecurity-jobs',
                'https://www.naukri.com/information-security-jobs',
                'https://www.naukri.com/security-analyst-jobs',
                'https://www.naukri.com/penetration-testing-jobs'
            ];

            for (const url of searchUrls) {
                try {
                    const response = await axios.get(url, {
                        headers: {
                            'User-Agent': this.getRandomUserAgent(),
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5'
                        },
                        timeout: 10000
                    });

                    const $ = cheerio.load(response.data);
                    
                    $('.jobTuple, .jobTupleHeader, .srp-jobtuple').each((index, element) => {
                        const jobElement = $(element);
                        const titleElement = jobElement.find('.title a, .jobTitle a, .jobTitle');
                        const companyElement = jobElement.find('.subTitle a, .companyName a, .companyName');
                        const locationElement = jobElement.find('.locationsContainer, .location');
                        const salaryElement = jobElement.find('.salary, .packageContainer');
                        const experienceElement = jobElement.find('.experience, .expwdth');

                        if (titleElement.length && companyElement.length) {
                            const title = titleElement.text().trim();
                            const company = companyElement.text().trim();
                            const location = locationElement.text().trim() || 'India';
                            const salary = salaryElement.text().trim();
                            const experience = experienceElement.text().trim();
                            const jobUrl = titleElement.attr('href');
                            
                            if (title && company && this.isCybersecurityRelated(title)) {
                                jobs.push({
                                    jobId: `naukri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    title,
                                    company,
                                    location,
                                    salary: salary || null,
                                    experience: experience || null,
                                    source: 'naukri',
                                    url: jobUrl ? `https://www.naukri.com${jobUrl}` : null,
                                    postedDate: new Date(),
                                    skills: this.extractSkills(title),
                                    description: title
                                });
                            }
                        }
                    });

                    await this.delay(2000);
                } catch (error) {
                    console.error(`Error scraping Naukri URL ${url}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Naukri scraping error:', error.message);
        }

        return jobs;
    }

    isCybersecurityRelated(title) {
        const keywords = [
            'cyber', 'security', 'analyst', 'engineer', 'architect', 'consultant',
            'penetration', 'testing', 'ethical', 'hacker', 'information', 'risk',
            'compliance', 'audit', 'soc', 'siem', 'incident', 'response', 'forensics',
            'vulnerability', 'assessment', 'grc', 'devsecops', 'cloud security',
            'network security', 'application security', 'infosec'
        ];
        
        const titleLower = title.toLowerCase();
        return keywords.some(keyword => titleLower.includes(keyword));
    }

    extractSkills(title) {
        const skillKeywords = [
            'SIEM', 'CISSP', 'CEH', 'CISA', 'CISM', 'AWS', 'Azure', 'Python',
            'Splunk', 'QRadar', 'Nessus', 'Metasploit', 'Burp Suite', 'Wireshark',
            'Firewall', 'IDS/IPS', 'PKI', 'LDAP', 'Active Directory', 'SOX',
            'PCI DSS', 'ISO 27001', 'NIST', 'OWASP', 'Penetration Testing',
            'Vulnerability Assessment', 'Incident Response', 'Forensics'
        ];
        
        const titleUpper = title.toUpperCase();
        return skillKeywords.filter(skill => titleUpper.includes(skill.toUpperCase()));
    }

    async scrapeAllJobs() {
        console.log('Starting comprehensive job scraping...');
        
        const allJobs = [];
        
        try {
            // Run scrapers in parallel
            const [linkedInJobs, indeedJobs, naukriJobs] = await Promise.all([
                this.scrapeLinkedInJobs(),
                this.scrapeIndeedJobs(),
                this.scrapeNaukriJobs()
            ]);
            
            allJobs.push(...linkedInJobs, ...indeedJobs, ...naukriJobs);
            
            console.log(`Scraped ${allJobs.length} total jobs`);
            return allJobs;
            
        } catch (error) {
            console.error('Error in comprehensive scraping:', error.message);
            return allJobs;
        }
    }
}

const jobScraper = new JobScraper();

// Save jobs to database
async function saveJobsToDatabase(jobs) {
    let savedCount = 0;
    let duplicateCount = 0;
    
    for (const jobData of jobs) {
        try {
            const existingJob = await Job.findOne({ jobId: jobData.jobId });
            
            if (!existingJob) {
                const job = new Job(jobData);
                await job.save();
                savedCount++;
            } else {
                // Update existing job
                await Job.updateOne({ jobId: jobData.jobId }, jobData);
                duplicateCount++;
            }
        } catch (error) {
            console.error('Error saving job:', error.message);
        }
    }
    
    console.log(`Saved ${savedCount} new jobs, updated ${duplicateCount} existing jobs`);
    return { saved: savedCount, updated: duplicateCount };
}

// API Routes
app.get('/api/jobs', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            search, 
            source, 
            location, 
            company,
            skills 
        } = req.query;
        
        const query = { isActive: true };
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (source) {
            query.source = source;
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (company) {
            query.company = { $regex: company, $options: 'i' };
        }
        
        if (skills) {
            const skillsArray = skills.split(',');
            query.skills = { $in: skillsArray };
        }
        
        const skip = (page - 1) * limit;
        
        const jobs = await Job.find(query)
            .sort({ scrapedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Job.countDocuments(query);
        
        res.json({
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        console.error('Error fetching job:', error.message);
        res.status(500).json({ error: 'Failed to fetch job' });
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
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        const topSkills = await Job.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        
        res.json({
            totalJobs,
            jobsBySource,
            topCompanies,
            topSkills,
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Error fetching stats:', error.message);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Manual scraping trigger
app.post('/api/scrape', async (req, res) => {
    try {
        console.log('Manual scraping triggered');
        const jobs = await jobScraper.scrapeAllJobs();
        const result = await saveJobsToDatabase(jobs);
        
        res.json({
            message: 'Scraping completed',
            jobsFound: jobs.length,
            ...result
        });
    } catch (error) {
        console.error('Manual scraping error:', error.message);
        res.status(500).json({ error: 'Scraping failed' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Serve static files (frontend)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Scheduled job scraping (every 4 hours)
cron.schedule('0 */4 * * *', async () => {
    console.log('Scheduled scraping started...');
    try {
        const jobs = await jobScraper.scrapeAllJobs();
        await saveJobsToDatabase(jobs);
        console.log('Scheduled scraping completed successfully');
    } catch (error) {
        console.error('Scheduled scraping error:', error.message);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`MongoDB URI: ${MONGODB_URI}`);
    
    // Initial scraping on startup (delayed)
    setTimeout(async () => {
        console.log('Running initial scraping...');
        try {
            const jobs = await jobScraper.scrapeAllJobs();
            await saveJobsToDatabase(jobs);
            console.log('Initial scraping completed');
        } catch (error) {
            console.error('Initial scraping error:', error.message);
        }
    }, 5000);
});

module.exports = app;