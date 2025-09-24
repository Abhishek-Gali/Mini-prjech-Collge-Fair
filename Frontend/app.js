// Frontend/app.js — API-driven with progress bar

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// DOM refs
const searchInput = document.querySelector('#job-search-input') || document.querySelector('input[type="search"]');
const jobsCountEl = document.querySelector('#jobs-count') || document.querySelector('h3, .jobs-count');
const jobsContainer = document.querySelector('#jobs-container') || document.querySelector('.jobs-grid, .jobs-list');
const loadingToast = document.querySelector('#loading-toast') || document.querySelector('.loading-toast');
const viewAllBtn = document.querySelector('#view-all-btn') || document.querySelector('button.view-all');
const platformRadios = document.querySelectorAll('input[name="platform"]');
const scrapeSelectedBtn = document.querySelector('#scrape-selected');
const scrapeBar = document.querySelector('#scrape-bar');

// Mini corner loader (kept small)
function showLoading(on = true) {
  if (!loadingToast) return;
  loadingToast.style.display = on ? 'block' : 'none';
}

// Linear progress bar shown while scraping
function showScrapeBar(on = true, label = 'Scraping selected platform…') {
  if (!scrapeBar) return;
  scrapeBar.style.display = on ? 'block' : 'none';
  const labelEl = scrapeBar.querySelector('.progress__label');
  if (labelEl) labelEl.textContent = label;
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

// Single fetch with cache-bypass and 304 retry
async function fetchJobs({ search = '', page = 1, limit = 50, source = '' } = {}) {
  const qs = new URLSearchParams({ page, limit });
  if (search) qs.set('search', search);
  if (source) qs.set('source', source);

  let res = await fetch(`${API_BASE_URL}/jobs?${qs.toString()}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store'
  });
  if (res.status === 304) {
    res = await fetch(`${API_BASE_URL}/jobs?${qs.toString()}`, { cache: 'reload' });
  }
  if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);
  const payload = await res.json();
  return payload.jobs || [];
}

// Forward selected platform to API and render result
async function loadJobs(search = '') {
  showLoading(true);
  try {
    const selected = document.querySelector('input[name="platform"]:checked')?.value || '';
    const jobs = await fetchJobs({ search, page: 1, limit: 50, source: selected });
    renderJobs(jobs);
  } catch (err) {
    console.error(err);
    renderJobs([]);
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

// Trigger backend scrape; show progress bar until data is reloaded
async function scrapeForSelected(mode = 'upsert') {
  const selected = document.querySelector('input[name="platform"]:checked')?.value || '';
  if (!selected) return;
  showScrapeBar(true, `Scraping ${selected}…`);
  try {
    const url = `${API_BASE_URL}/scrape?source=${encodeURIComponent(selected)}${mode ? `&mode=${mode}` : ''}`;
    await fetch(url, { method: 'POST' });
    await loadJobs('');          // replace progress with cards
  } catch (e) {
    console.error(e);
  } finally {
    showScrapeBar(false);
  }
}

// Search debounce
if (searchInput) {
  let t = null;
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(t);
    t = setTimeout(() => loadJobs(q), 400);
  });
}

// View All
if (viewAllBtn) viewAllBtn.addEventListener('click', () => loadJobs(''));

// Platform change -> reload
platformRadios.forEach(r => r.addEventListener('change', () => loadJobs(searchInput?.value?.trim() || '')));

// Scrape button
if (scrapeSelectedBtn) scrapeSelectedBtn.addEventListener('click', () => scrapeForSelected('upsert'));

// Initial load
document.addEventListener('DOMContentLoaded', () => { loadJobs(''); });
