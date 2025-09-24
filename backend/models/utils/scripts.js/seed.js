// backend/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const now = new Date();
  const jobs = [
    {
      jobId: 'seed_1',
      title: 'Security Engineer',
      company: 'SeedCorp',
      location: 'Hyderabad',
      salary: '₹8–14 LPA',
      experience: '2–4 years',
      description: 'Build and operate security tooling',
      skills: ['Python', 'SIEM', 'Cloud'],
      source: 'seed',
      url: 'https://example.com',
      postedDate: now,
      scrapedAt: now,
      isActive: true,
    },
    {
      jobId: 'seed_2',
      title: 'SOC Analyst',
      company: 'BlueTeam Labs',
      location: 'Bengaluru',
      salary: '₹4–7 LPA',
      experience: '0–2 years',
      description: 'Monitor SIEM and triage alerts',
      skills: ['SIEM', 'Linux', 'Networking'],
      source: 'seed',
      url: 'https://example.com/soc',
      postedDate: now,
      scrapedAt: now,
      isActive: true,
    }
  ];

  await Job.insertMany(jobs, { ordered: false }).catch(() => {});
  const count = await Job.countDocuments();
  console.log(`Seed complete, total docs: ${count}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
