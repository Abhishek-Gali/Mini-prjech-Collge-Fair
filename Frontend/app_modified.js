
// Updated app.js to connect to the backend API
// Replace the static jobsData with API calls

// API Configuration
const API_BASE_URL = 'https://localhost:5000/api'; // Replace with your Render URL
// For local development, use: const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let filteredJobs = [];
let currentSelectedJob = null;
let isLoading = false;

// DOM Elements
let searchInput, clearSearchBtn, jobsGrid, noResults, resultsCount;
let skillsModal, applicationModal, loadingIndicator;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    searchInput = document.getElementById('searchInput');
    clearSearchBtn = document.getElementById('clearSearch');
    jobsGrid = document.getElementById('jobsGrid');
    noResults = document.getElementById('noResults');
    resultsCount = document.getElementById('resultsCount');
    skillsModal = document.getElementById('skillsModal');
    applicationModal = document.getElementById('applicationModal');
    loadingIndicator = document.getElementById('loadingIndicator');

    // Load initial jobs
    loadJobs();

    // Setup event listeners
    setupEventListeners();
});

// API Functions
async function fetchJobs(filters = {}) {
    try {
        isLoading = true;
        showLoading();

        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.source) params.append('source', filters.source);
        if (filters.location) params.append('location', filters.location);
        if (filters.company) params.append('company', filters.company);
        if (filters.skills) params.append('skills', filters.skills);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const url = `${API_BASE_URL}/jobs?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching jobs:', error);
        showError('Failed to load jobs. Please check your connection and try again.');
        return { jobs: [], pagination: { total: 0 } };
    } finally {
        isLoading = false;
        hideLoading();
    }
}

async function fetchJobById(jobId) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error fetching job details:', error);
        return null;
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

async function triggerManualScraping() {
    try {
        showLoading('Scraping new jobs...');

        const response = await fetch(`${API_BASE_URL}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Scraping result:', result);

        // Reload jobs after scraping
        await loadJobs();

        showMessage(`Scraping completed! Found ${result.jobsFound} jobs.`);

    } catch (error) {
        console.error('Error triggering scraping:', error);
        showError('Failed to trigger scraping. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Load jobs function
async function loadJobs(filters = {}) {
    const data = await fetchJobs(filters);
    filteredJobs = data.jobs || [];

    renderJobs(filteredJobs);
    updateResultsCount(data.pagination?.total || 0);
}

// Event Listeners Setup
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', handleClearSearch);
    }

    // Add refresh button event listener
    const refreshBtn = document.getElementById('refreshJobs');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadJobs();
        });
    }

    // Add manual scraping button event listener
    const scrapeBtn = document.getElementById('triggerScraping');
    if (scrapeBtn) {
        scrapeBtn.addEventListener('click', triggerManualScraping);
    }

    // Modal event listeners
    document.addEventListener('keydown', handleKeyPress);

    // Form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }
}

// Search functionality with API integration
async function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();

    if (query.length > 2 || query.length === 0) { // Only search after 3+ characters or empty
        clearSearchBtn.classList.toggle('visible', query.length > 0);

        const filters = query.length > 0 ? { search: query } : {};
        await loadJobs(filters);
    }
}

function handleClearSearch(event) {
    event.preventDefault();
    event.stopPropagation();
    clearSearch();
}

async function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.classList.remove('visible');

        await loadJobs(); // Reload all jobs
        searchInput.focus();
    }
}

// Job rendering functions
function renderJobs(jobs) {
    if (!jobsGrid) return;

    jobsGrid.innerHTML = '';

    if (jobs.length === 0) {
        jobsGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    jobsGrid.classList.remove('hidden');
    noResults.classList.add('hidden');

    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsGrid.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${job.title} at ${job.company}`);
    card.setAttribute('data-job-id', job._id);

    // Determine employment rate class (fallback if not provided)
    const employmentRateClass = 'high'; // Default fallback

    // Format salary (handle both old and new format)
    const salary = job.salary || 'Salary not disclosed';

    // Format experience
    const experience = job.experience || 'Not specified';

    // Format posted date
    const postedDate = job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently';

    // Format skills
    const skillsHtml = job.skills && job.skills.length > 0 
        ? job.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<span class="skill-tag">General Security</span>';

    card.innerHTML = `
        <div class="job-card-header">
            <div>
                <h3 class="job-title">${job.title}</h3>
                <p class="job-company">${job.company}</p>
            </div>
            <span class="employment-rate employment-rate--${employmentRateClass}">
                ${job.source || 'Unknown'}
            </span>
        </div>

        <div class="job-details">
            <div class="job-detail">
                <span class="job-detail-label">Salary</span>
                <span class="job-detail-value job-salary">${salary}</span>
            </div>
            <div class="job-detail">
                <span class="job-detail-label">Experience</span>
                <span class="job-detail-value">${experience}</span>
            </div>
        </div>

        <p class="job-location">📍 ${job.location}</p>

        <div class="job-skills">
            ${skillsHtml}
        </div>

        <div class="job-meta">
            <small>Posted: ${postedDate} • Source: ${job.source}</small>
        </div>

        <div class="job-actions">
            <button class="btn btn--apply" onclick="openJobDetails('${job._id}')">
                View Details
            </button>
            ${job.url ? `<a href="${job.url}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary">Apply Now</a>` : ''}
        </div>
    `;

    // Add click event for the entire card
    card.addEventListener('click', () => openJobDetails(job._id));

    return card;
}

// Job details modal
async function openJobDetails(jobId) {
    const job = await fetchJobById(jobId);

    if (!job) {
        showError('Failed to load job details');
        return;
    }

    currentSelectedJob = job;

    // Update modal content
    document.getElementById('modalJobTitle').textContent = job.title;
    document.getElementById('modalCompany').textContent = job.company;
    document.getElementById('modalLocation').textContent = job.location;
    document.getElementById('modalSalary').textContent = job.salary || 'Not disclosed';
    document.getElementById('modalExperience').textContent = job.experience || 'Not specified';
    document.getElementById('modalSource').textContent = job.source;

    // Update skills
    const skillsContainer = document.getElementById('modalSkills');
    if (job.skills && job.skills.length > 0) {
        skillsContainer.innerHTML = job.skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
    } else {
        skillsContainer.innerHTML = '<span class="skill-tag">General Security</span>';
    }

    // Update description
    const descriptionContainer = document.getElementById('modalDescription');
    descriptionContainer.textContent = job.description || job.title;

    // Update apply button
    const applyBtn = document.getElementById('modalApplyBtn');
    if (job.url) {
        applyBtn.href = job.url;
        applyBtn.style.display = 'inline-block';
    } else {
        applyBtn.style.display = 'none';
    }

    // Show modal
    skillsModal.classList.remove('hidden');
}

// Update results count
function updateResultsCount(total = null) {
    if (!resultsCount) return;

    if (total !== null) {
        resultsCount.textContent = `${total} jobs found`;
    } else {
        resultsCount.textContent = `${filteredJobs.length} jobs found`;
    }
}

// Loading states
function showLoading(message = 'Loading jobs...') {
    if (loadingIndicator) {
        loadingIndicator.querySelector('.loading-text').textContent = message;
        loadingIndicator.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

// Error handling
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-message">${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

// Success message
function showMessage(message) {
    // Create success notification
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-notification';
    messageDiv.innerHTML = `
        <div class="success-content">
            <span class="success-icon">✅</span>
            <span class="success-message">${message}</span>
            <button class="success-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(messageDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 3000);
}

// Modal handling
function handleKeyPress(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

function closeModal() {
    if (skillsModal) {
        skillsModal.classList.add('hidden');
    }
    if (applicationModal) {
        applicationModal.classList.add('hidden');
    }
}

// Application form handling
function handleApplicationSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const applicationData = Object.fromEntries(formData.entries());

    console.log('Application submitted:', applicationData);

    // Show success message
    showMessage('Application submitted successfully!');

    // Close modal
    closeModal();

    // Reset form
    event.target.reset();
}

// Add some CSS for notifications
const notificationStyles = `
    .error-notification, .success-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    }

    .error-notification {
        background: #fee;
        border: 1px solid #fcc;
        color: #c33;
    }

    .success-notification {
        background: #efe;
        border: 1px solid #cfc;
        color: #3c3;
    }

    .error-content, .success-content {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .error-close, .success-close {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.7;
    }

    .error-close:hover, .success-close:hover {
        opacity: 1;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .job-skills {
        margin: 12px 0;
    }

    .job-meta {
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--color-border);
    }
`;

// Add the notification styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Health check on page load
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            console.log('✅ Backend is healthy');
        } else {
            throw new Error('Backend health check failed');
        }
    } catch (error) {
        console.warn('⚠️ Backend might be offline:', error.message);
        showError('Backend service is currently unavailable. Please try again later.');
    }
}

// Run health check on page load
checkBackendHealth();
