# Cybersecurity Jobs Backend

A Node.js backend application that automatically scrapes cybersecurity job listings from LinkedIn, Indeed, and Naukri.com and provides a REST API for accessing the data.

## Features

- **Automated Scraping**: Scrapes job listings every 4 hours automatically
- **Multi-Platform Support**: Scrapes from LinkedIn, Indeed, and Naukri.com
- **RESTful API**: Clean API endpoints for accessing job data
- **Search & Filtering**: Advanced search capabilities with filters
- **Database Storage**: MongoDB for persistent data storage
- **Rate Limiting**: Respectful scraping with proper delays
- **Real-time Updates**: Jobs are continuously updated

## API Endpoints

### Get Jobs
```
GET /api/jobs
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Jobs per page (default: 50)
- `search`: Search in title, company, description
- `source`: Filter by source (linkedin, indeed, naukri)
- `location`: Filter by location
- `company`: Filter by company name
- `skills`: Comma-separated skills

### Get Job by ID
```
GET /api/jobs/:id
```

### Get Statistics
```
GET /api/stats
```

### Manual Scraping Trigger
```
POST /api/scrape
```

### Health Check
```
GET /api/health
```

## Deployment on Render.com

### 1. Prerequisites
- GitHub account
- Render.com account
- MongoDB Atlas account (free tier available)

### 2. Setup MongoDB Atlas

1. Create a free MongoDB Atlas cluster
2. Create a database user
3. Get your connection string
4. Whitelist Render.com IP addresses (or use 0.0.0.0/0 for all IPs)

### 3. Deploy to Render

1. **Fork/Clone Repository**: Push your code to GitHub

2. **Connect to Render**:
   - Go to [Render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**:
   - **Name**: cybersecurity-jobs-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables**:
   Add these environment variables in Render dashboard:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   NODE_ENV=production
   PORT=5000
   ```

5. **Deploy**: Click "Create Web Service"

### 4. Post-Deployment

- Your API will be available at: `https://your-service-name.onrender.com`
- Health check: `https://your-service-name.onrender.com/api/health`
- Jobs endpoint: `https://your-service-name.onrender.com/api/jobs`

## Local Development

1. **Clone Repository**
```bash
git clone <your-repo-url>
cd cybersecurity-jobs-backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Test API**
```bash
curl http://localhost:5000/api/health
```

## Scraping Configuration

The scraper targets cybersecurity-related jobs using keywords:
- cyber, security, analyst, engineer, architect
- penetration testing, ethical hacking
- information security, risk management
- compliance, audit, SOC, SIEM
- incident response, forensics

## Rate Limiting & Ethics

- 2-second delays between requests
- Respectful scraping practices
- Only public job data
- Compliant with robots.txt guidelines

## Database Schema

```javascript
{
  jobId: String,        // Unique job identifier
  title: String,        // Job title
  company: String,      // Company name
  location: String,     // Job location
  salary: String,       // Salary information
  experience: String,   // Experience required
  description: String,  // Job description
  skills: [String],     // Required skills
  source: String,       // linkedin/indeed/naukri
  url: String,          // Original job URL
  postedDate: Date,     // Job posting date
  scrapedAt: Date,      // When job was scraped
  isActive: Boolean     // Job availability status
}
```

## Frontend Integration

This backend is designed to work with the provided frontend. Update your frontend's API base URL to point to your deployed Render service:

```javascript
const API_BASE_URL = 'https://your-service-name.onrender.com/api';
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check connection string format
   - Verify database user credentials
   - Ensure IP whitelist includes Render IPs

2. **Scraping Returns No Results**
   - Websites may have changed their structure
   - Check if sites are blocking requests
   - Verify User-Agent strings

3. **Memory Issues on Free Tier**
   - Reduce scraping frequency
   - Implement job cleanup for old entries
   - Optimize database queries

### Logs and Monitoring:

- Check Render logs in dashboard
- Monitor memory usage
- Set up alerts for failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details