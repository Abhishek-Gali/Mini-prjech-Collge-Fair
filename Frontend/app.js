// Frontend/app.js — API-driven

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// DOM refs (adjust selectors if your HTML differs)
const searchInput = document.querySelector('#job-search-input') || document.querySelector('input[type="search"]');
const jobsCountEl = document.querySelector('#jobs-count') || document.querySelector('h3, .jobs-count');
const jobsContainer = document.querySelector('#jobs-container') || document.querySelector('.jobs-grid, .jobs-list');
const loadingToast = document.querySelector('#loading-toast') || document.querySelector('.loading-toast');
const viewAllBtn = document.querySelector('#view-all-btn') || document.querySelector('button.view-all');

function showLoading(on = true) {
  if (!loadingToast) return;
  loadingToast.style.display = on ? 'block' : 'none';
}

function setJobsCount(n) {
  if (!jobsCountEl) return;
  jobsCountEl.textContent = `${n} jobs found`;
}

function buildJobCard(job) {
  const skills = (job.skills || []).slice(0, 6).map(s => `<span class="chip">${s}</span>`).join(' ');
  const salary = job.salary ? `<span class="salary">${job.salary}</span>` : '';
  const exp = job.experience ? `<span class="experience">${job.experience}</span>` : '';
  const posted = job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '';
  const source = job.source ? `<span class="source">${job.source}</span>` : '';

  const html = `
    <article class="job-card">
      <header class="job-card__header">
        <h4 class="job-title">${job.title || 'Role'}</h4>
        <a class="company" href="${job.url || '#'}" target="_blank" rel="noopener">${job.company || ''}</a>
      </header>
      <div class="meta">
        <span class="location">${job.location || 'India'}</span>
        ${salary}
        ${exp}
        ${source}
      </div>
      <p class="desc">${(job.description || '').slice(0, 160)}</p>
      <div class="skills">${skills}</div>
      <footer class="job-card__footer">
        <span class="posted">${posted}</span>
        <a class="btn" href="${job.url || '#'}" target="_blank" rel="noopener">View</a>
      </footer>
    </article>
  `;
  const el = document.createElement('div');
  el.innerHTML = html.trim();
  return el.firstElementChild;
}

function renderJobs(jobs) {
  if (!jobsContainer) return;
  jobsContainer.innerHTML = '';
  if (!jobs || jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔎</div>
        <h4>No jobs found</h4>
        <p>Try broader terms or click “View All”.</p>
      </div>
    `;
    setJobsCount(0);
    return;
  }
  const frag = document.createDocumentFragment();
  jobs.forEach(j => frag.appendChild(buildJobCard(j)));
  jobsContainer.appendChild(frag);
  setJobsCount(jobs.length);
}

async function fetchJobs({ search = '', page = 1, limit = 50 } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  qs.set('page', page);
  qs.set('limit', limit);

  const url = `${API_BASE_URL}/jobs?${qs.toString()}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);
  const payload = await res.json();
  return payload.jobs || [];
}

async function loadJobs(search = '') {
  try {
    showLoading(true);
    const jobs = await fetchJobs({ search, page: 1, limit: 50 });
    renderJobs(jobs);
  } catch (err) {
    console.error(err);
    renderJobs([]);
    // optional toast element
    const toast = document.querySelector('.toast-error');
    if (toast) {
      toast.textContent = 'Failed to load jobs. Please try again.';
      toast.style.display = 'block';
      setTimeout(() => (toast.style.display = 'none'), 4000);
    }
  } finally {
    showLoading(false);
  }
}

// Wire search
if (searchInput) {
  let t = null;
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(t);
    t = setTimeout(() => loadJobs(q), 400);
  });
}

// View All
if (viewAllBtn) {
  viewAllBtn.addEventListener('click', () => loadJobs(''));
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadJobs('');
});

// Add near other refs
const platformRadios = document.querySelectorAll('input[name="platform"]');
const scrapeSelectedBtn = document.querySelector('#scrape-selected');

// Extend fetchJobs to accept source
async function fetchJobs({ search = '', page = 1, limit = 50, source = '' } = {}) {
  const qs = new URLSearchParams({ page, limit });
  if (search) qs.set('search', search);
  if (source) qs.set('source', source);
  const res = await fetch(`${API_BASE_URL}/jobs?${qs.toString()}`, { headers: { 'Accept':'application/json' } });
  if (!res.ok) throw new Error('Failed to load jobs');
  const payload = await res.json();
  return payload.jobs || [];
}

// Update loadJobs to forward selected source
async function loadJobs(search = '') {
  showLoading(true);
  try {
    const selected = document.querySelector('input[name="platform"]:checked')?.value || '';
    const jobs = await fetchJobs({ search, page: 1, limit: 50, source: selected });
    renderJobs(jobs);
  } catch (e) {
    console.error(e); renderJobs([]);
  } finally {
    showLoading(false);
  }
}

// Trigger scrape for the chosen platform, then reload jobs
async function scrapeForSelected() {
  const selected = document.querySelector('input[name="platform"]:checked')?.value || '';
  if (!selected) return;
  showLoading(true);
  try {
    await fetch(`${API_BASE_URL}/scrape?source=${encodeURIComponent(selected)}`, { method: 'POST' });
    await loadJobs('');
  } catch (e) {
    console.error(e);
  } finally {
    showLoading(false);
  }
}

if (scrapeSelectedBtn) scrapeSelectedBtn.addEventListener('click', scrapeForSelected);
platformRadios.forEach(r => r.addEventListener('change', () => loadJobs(searchInput?.value?.trim() || '')));
