require('dotenv').config();
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  salary: String,
  experience: String,
  description: String,
  skills: [String],
  source: { type: String, required: true },
  url: String,
  postedDate: Date,
  scrapedAt: Date,
  isActive: { type: Boolean, default: true }
});
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri);
  const now = new Date();
  const docs = [
    { jobId: 'seed_1', title: 'Security Engineer', company: 'SeedCorp', location: 'Hyderabad', salary: '₹8–14 LPA', experience: '2–4 years', description: 'Build and operate security tooling', skills: ['Python','SIEM','Cloud'], source: 'seed', url: 'https://example.com', postedDate: now, scrapedAt: now, isActive: true },
    { jobId: 'seed_2', title: 'SOC Analyst', company: 'BlueTeam Labs', location: 'Bengaluru', salary: '₹4–7 LPA', experience: '0–2 years', description: 'Monitor SIEM and triage alerts', skills: ['SIEM','Linux','Networking'], source: 'seed', url: 'https://example.com/soc', postedDate: now, scrapedAt: now, isActive: true }
  ];
  await Job.insertMany(docs, { ordered: false }).catch(() => {});
  const count = await Job.countDocuments();
  console.log('Seed complete. Total docs:', count);
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
