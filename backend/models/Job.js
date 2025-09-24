// backend/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    jobId: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, default: 'India' },
    salary: { type: String, default: null },
    experience: { type: String, default: null },
    description: { type: String, default: '' },
    skills: { type: [String], default: [] },
    source: { type: String, enum: ['naukri', 'indeed', 'linkedin', 'seed'], required: true, index: true },
    url: { type: String, default: null },
    postedDate: { type: Date, default: Date.now },
    scrapedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
