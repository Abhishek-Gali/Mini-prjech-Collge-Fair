# Deployment Checklist for Render.com

## Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account (free tier)
- [ ] Create a new cluster
- [ ] Create database user with read/write permissions
- [ ] Get connection string
- [ ] Whitelist IP addresses (use 0.0.0.0/0 for all IPs)
- [ ] Test connection locally

### 2. GitHub Repository Setup
- [ ] Push all backend files to GitHub repository
- [ ] Ensure all files are committed:
  - [ ] server.js
  - [ ] package.json
  - [ ] .env.example
  - [ ] README.md
  - [ ] .gitignore
  - [ ] render.yaml (optional)

### 3. Environment Variables
- [ ] Prepare MongoDB connection string
- [ ] Note down all required environment variables

## Render.com Deployment Steps

### 1. Account Setup
- [ ] Sign up at Render.com
- [ ] Connect GitHub account
- [ ] Verify email address

### 2. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select the repository containing backend code

### 3. Configure Service
- [ ] **Name**: cybersecurity-jobs-api (or your preferred name)
- [ ] **Environment**: Node
- [ ] **Build Command**: npm install
- [ ] **Start Command**: npm start
- [ ] **Plan**: Free (or paid if needed)

### 4. Environment Variables Setup
Add these environment variables in Render dashboard:
- [ ] `MONGODB_URI`: Your MongoDB Atlas connection string
- [ ] `NODE_ENV`: production
- [ ] `PORT`: 5000 (usually auto-detected)

### 5. Deploy Service
- [ ] Click "Create Web Service"
- [ ] Wait for initial deployment to complete
- [ ] Check deployment logs for any errors

## Post-Deployment Verification

### 1. API Testing
- [ ] Test health endpoint: `https://your-service-name.onrender.com/api/health`
- [ ] Test jobs endpoint: `https://your-service-name.onrender.com/api/jobs`
- [ ] Test manual scraping: `POST https://your-service-name.onrender.com/api/scrape`
- [ ] Test statistics: `https://your-service-name.onrender.com/api/stats`

### 2. Database Verification
- [ ] Check MongoDB Atlas dashboard for new data
- [ ] Verify job documents are being created
- [ ] Check database connection in Render logs

### 3. Scraping Verification
- [ ] Monitor logs for scraping activities
- [ ] Verify jobs are being scraped from all sources
- [ ] Check scheduled scraping is working (every 4 hours)

### 4. Frontend Integration
- [ ] Update frontend API base URL to your Render service URL
- [ ] Test frontend-backend integration
- [ ] Verify CORS settings allow frontend requests

## Troubleshooting Common Issues

### MongoDB Connection Issues
- [ ] Verify connection string format
- [ ] Check database user credentials
- [ ] Ensure IP whitelist includes Render IPs
- [ ] Test connection string locally first

### Scraping Issues
- [ ] Check if target websites have changed structure
- [ ] Verify User-Agent strings are acceptable
- [ ] Monitor rate limiting and delays
- [ ] Check for anti-bot measures

### Performance Issues
- [ ] Monitor memory usage on free tier (512MB limit)
- [ ] Optimize database queries
- [ ] Consider reducing scraping frequency
- [ ] Implement job cleanup for old entries

### CORS Issues
- [ ] Verify CORS settings in server.js
- [ ] Add frontend domain to allowed origins
- [ ] Test preflight requests

## Monitoring and Maintenance

### Regular Checks
- [ ] Monitor Render service logs
- [ ] Check database growth and usage
- [ ] Verify scraping is working consistently
- [ ] Monitor API response times

### Updates and Maintenance
- [ ] Keep dependencies updated
- [ ] Monitor for website structure changes
- [ ] Update scraping logic as needed
- [ ] Implement log rotation if needed

## Notes
- Free tier on Render has limitations (512MB RAM, goes to sleep after inactivity)
- Service will automatically wake up when receiving requests
- Consider upgrading to paid plan for production use
- MongoDB Atlas free tier provides 512MB storage