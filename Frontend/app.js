// Cybersecurity Jobs Data
const jobsData = {
  "jobs": [
    {
      "id": 1,
      "company": "TCS (Tata Consultancy Services)",
      "position": "Cybersecurity Analyst",
      "salary": "₹4,00,000 - ₹9,00,000",
      "experience": "0-3 years",
      "employmentRate": "High",
      "authority": "Junior",
      "location": "Mumbai, Bangalore, Chennai",
      "skills": ["SIEM Tools", "Network Security", "Incident Response", "Risk Assessment", "Security Monitoring"],
      "certifications": ["CompTIA Security+", "CEH", "CISSP Associate"],
      "responsibilities": ["Monitor security alerts and events", "Investigate security incidents", "Perform vulnerability assessments", "Document security procedures"]
    },
    {
      "id": 2,
      "company": "Infosys",
      "position": "Security Engineer",
      "salary": "₹6,00,000 - ₹15,00,000",
      "experience": "2-5 years",
      "employmentRate": "Very High",
      "authority": "Mid-Level",
      "location": "Bangalore, Hyderabad, Pune",
      "skills": ["Firewall Configuration", "Python", "AWS Security", "DevSecOps", "Penetration Testing"],
      "certifications": ["CISSP", "AWS Security Specialty", "OSCP"],
      "responsibilities": ["Design security architecture", "Implement security controls", "Conduct security reviews", "Automate security processes"]
    },
    {
      "id": 3,
      "company": "Accenture",
      "position": "Security Consultant",
      "salary": "₹8,00,000 - ₹25,00,000",
      "experience": "3-7 years",
      "employmentRate": "Very High",
      "authority": "Mid-Level",
      "location": "Gurgaon, Mumbai, Bangalore",
      "skills": ["GRC", "ISO 27001", "Risk Management", "Security Auditing", "Compliance Frameworks"],
      "certifications": ["CISA", "CISM", "ISO 27001 Lead Auditor"],
      "responsibilities": ["Conduct security assessments", "Develop security policies", "Ensure regulatory compliance", "Provide client consulting"]
    },
    {
      "id": 4,
      "company": "Wipro",
      "position": "SOC Analyst",
      "salary": "₹3,50,000 - ₹8,00,000",
      "experience": "1-4 years",
      "employmentRate": "High",
      "authority": "Junior",
      "location": "Bangalore, Chennai, Hyderabad",
      "skills": ["Splunk", "QRadar", "Threat Hunting", "Malware Analysis", "Network Forensics"],
      "certifications": ["GCIH", "GCFA", "SOC Analyst Certification"],
      "responsibilities": ["Monitor security dashboards", "Analyze security alerts", "Perform threat hunting", "Coordinate incident response"]
    },
    {
      "id": 5,
      "company": "HCL Technologies",
      "position": "Penetration Tester",
      "salary": "₹5,00,000 - ₹15,00,000",
      "experience": "2-6 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Noida, Chennai, Bangalore",
      "skills": ["Metasploit", "Burp Suite", "Nmap", "Web Application Testing", "Social Engineering"],
      "certifications": ["CEH", "OSCP", "GPEN"],
      "responsibilities": ["Conduct penetration testing", "Identify vulnerabilities", "Write detailed reports", "Provide remediation guidance"]
    },
    {
      "id": 6,
      "company": "IBM India",
      "position": "Security Architect",
      "salary": "₹15,00,000 - ₹40,00,000",
      "experience": "5-12 years",
      "employmentRate": "Very High",
      "authority": "Senior",
      "location": "Bangalore, Mumbai, Delhi",
      "skills": ["Enterprise Architecture", "Zero Trust", "Cloud Security", "Identity Management", "Threat Modeling"],
      "certifications": ["SABSA", "TOGAF", "CISSP", "CCSP"],
      "responsibilities": ["Design security frameworks", "Lead architecture reviews", "Develop security strategies", "Mentor junior staff"]
    },
    {
      "id": 7,
      "company": "Deloitte India",
      "position": "Cyber Risk Manager",
      "salary": "₹12,00,000 - ₹35,00,000",
      "experience": "4-10 years",
      "employmentRate": "Very High",
      "authority": "Senior",
      "location": "Mumbai, Gurgaon, Hyderabad",
      "skills": ["Risk Assessment", "NIST Framework", "Third-party Risk", "Business Continuity", "Crisis Management"],
      "certifications": ["CRISC", "CISA", "CISM"],
      "responsibilities": ["Assess cyber risks", "Develop risk strategies", "Manage vendor risks", "Report to executives"]
    },
    {
      "id": 8,
      "company": "Palo Alto Networks India",
      "position": "Cloud Security Engineer",
      "salary": "₹10,00,000 - ₹25,00,000",
      "experience": "3-8 years",
      "employmentRate": "Very High",
      "authority": "Mid-Level",
      "location": "Bangalore, Mumbai",
      "skills": ["Prisma Cloud", "AWS", "Azure", "Kubernetes Security", "Container Security"],
      "certifications": ["CCSP", "AWS Security", "Azure Security", "Prisma Certified"],
      "responsibilities": ["Secure cloud environments", "Implement cloud policies", "Monitor cloud security", "Automate security tasks"]
    },
    {
      "id": 9,
      "company": "KPMG India",
      "position": "Digital Forensics Analyst",
      "salary": "₹6,00,000 - ₹18,00,000",
      "experience": "2-6 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Mumbai, Delhi, Bangalore",
      "skills": ["EnCase", "FTK", "Volatility", "Mobile Forensics", "Network Forensics"],
      "certifications": ["GCFA", "GCFE", "CCE"],
      "responsibilities": ["Conduct forensic investigations", "Analyze digital evidence", "Prepare court reports", "Testify in legal proceedings"]
    },
    {
      "id": 10,
      "company": "Capgemini India",
      "position": "Identity & Access Management Specialist",
      "salary": "₹7,00,000 - ₹20,00,000",
      "experience": "3-7 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Mumbai, Pune, Chennai",
      "skills": ["Active Directory", "SailPoint", "Okta", "LDAP", "SAML"],
      "certifications": ["CISSP", "SailPoint Certified", "Okta Certified"],
      "responsibilities": ["Manage user identities", "Implement access controls", "Conduct access reviews", "Ensure compliance"]
    },
    {
      "id": 11,
      "company": "Tech Mahindra",
      "position": "Threat Intelligence Analyst",
      "salary": "₹5,50,000 - ₹14,00,000",
      "experience": "2-5 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Pune, Hyderabad, Bangalore",
      "skills": ["MITRE ATT&CK", "Threat Hunting", "OSINT", "IOC Analysis", "TIP Platforms"],
      "certifications": ["GCTI", "CTIA", "SANS FOR578"],
      "responsibilities": ["Analyze threat intelligence", "Track threat actors", "Develop IOCs", "Brief security teams"]
    },
    {
      "id": 12,
      "company": "Cognizant",
      "position": "Incident Response Manager",
      "salary": "₹9,00,000 - ₹25,00,000",
      "experience": "4-9 years",
      "employmentRate": "Very High",
      "authority": "Senior",
      "location": "Chennai, Mumbai, Bangalore",
      "skills": ["Incident Response", "Digital Forensics", "Crisis Management", "SIEM", "Malware Analysis"],
      "certifications": ["GCIH", "GCFA", "CISSP"],
      "responsibilities": ["Lead incident response", "Coordinate with teams", "Manage communications", "Conduct post-incident reviews"]
    },
    {
      "id": 13,
      "company": "L&T Technology Services",
      "position": "IoT Security Engineer",
      "salary": "₹6,50,000 - ₹16,00,000",
      "experience": "2-6 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Bangalore, Pune, Chennai",
      "skills": ["IoT Protocols", "Embedded Security", "Firmware Analysis", "Hardware Security", "Wireless Security"],
      "certifications": ["IoT Security Foundation", "CISSP", "Hardware Security"],
      "responsibilities": ["Secure IoT devices", "Analyze firmware", "Test hardware security", "Develop security protocols"]
    },
    {
      "id": 14,
      "company": "Persistent Systems",
      "position": "DevSecOps Engineer",
      "salary": "₹8,00,000 - ₹20,00,000",
      "experience": "3-7 years",
      "employmentRate": "Very High",
      "authority": "Mid-Level",
      "location": "Pune, Goa, Nagpur",
      "skills": ["Jenkins", "Docker", "Kubernetes", "SAST/DAST", "GitLab CI/CD"],
      "certifications": ["DevSecOps Foundation", "Kubernetes Security", "AWS DevOps"],
      "responsibilities": ["Integrate security in CI/CD", "Automate security testing", "Manage container security", "Train development teams"]
    },
    {
      "id": 15,
      "company": "Mindtree (LTI Mindtree)",
      "position": "Blockchain Security Specialist",
      "salary": "₹10,00,000 - ₹28,00,000",
      "experience": "4-8 years",
      "employmentRate": "High",
      "authority": "Senior",
      "location": "Bangalore, Bhubaneswar, Chennai",
      "skills": ["Smart Contract Security", "Ethereum", "Hyperledger", "Cryptography", "DeFi Security"],
      "certifications": ["Certified Blockchain Security Professional", "Ethereum Developer", "Hyperledger"],
      "responsibilities": ["Audit smart contracts", "Secure blockchain networks", "Assess DeFi protocols", "Research new threats"]
    },
    {
      "id": 16,
      "company": "Mphasis",
      "position": "Application Security Engineer",
      "salary": "₹6,00,000 - ₹16,00,000",
      "experience": "2-6 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Bangalore, Pune, Chennai",
      "skills": ["OWASP", "Static Analysis", "Dynamic Analysis", "Secure Coding", "Web Application Security"],
      "certifications": ["CSSLP", "GWEB", "CEH"],
      "responsibilities": ["Conduct code reviews", "Perform security testing", "Train developers", "Implement security standards"]
    },
    {
      "id": 17,
      "company": "Hexaware Technologies",
      "position": "Compliance Manager - Cybersecurity",
      "salary": "₹11,00,000 - ₹30,00,000",
      "experience": "5-10 years",
      "employmentRate": "High",
      "authority": "Senior",
      "location": "Mumbai, Chennai, Pune",
      "skills": ["SOX", "PCI DSS", "GDPR", "HIPAA", "Audit Management"],
      "certifications": ["CISA", "CISM", "PCI QSA"],
      "responsibilities": ["Ensure regulatory compliance", "Manage audits", "Develop policies", "Train staff on compliance"]
    },
    {
      "id": 18,
      "company": "Cybertech Systems and Software",
      "position": "Malware Analyst",
      "salary": "₹5,00,000 - ₹13,00,000",
      "experience": "2-5 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Mumbai, Delhi, Bangalore",
      "skills": ["Reverse Engineering", "IDA Pro", "Ghidra", "Sandbox Analysis", "Assembly Language"],
      "certifications": ["GREM", "Certified Malware Analyst", "SANS FOR610"],
      "responsibilities": ["Analyze malware samples", "Reverse engineer threats", "Develop signatures", "Research new malware families"]
    },
    {
      "id": 19,
      "company": "Quick Heal Technologies",
      "position": "Security Research Engineer",
      "salary": "₹7,00,000 - ₹18,00,000",
      "experience": "3-7 years",
      "employmentRate": "High",
      "authority": "Mid-Level",
      "location": "Pune, Mumbai",
      "skills": ["Vulnerability Research", "Exploit Development", "Fuzzing", "Binary Analysis", "0-day Research"],
      "certifications": ["OSCE", "OSEE", "GXPN"],
      "responsibilities": ["Research vulnerabilities", "Develop exploits", "Write security advisories", "Present at conferences"]
    },
    {
      "id": 20,
      "company": "Paladion Networks",
      "position": "CISO (Chief Information Security Officer)",
      "salary": "₹35,00,000 - ₹80,00,000",
      "experience": "10-20 years",
      "employmentRate": "Very High",
      "authority": "Executive",
      "location": "Mumbai, Bangalore, Delhi",
      "skills": ["Strategic Planning", "Board Reporting", "Enterprise Risk Management", "Security Governance", "Regulatory Compliance"],
      "certifications": ["CISSP", "CISM", "CCISO"],
      "responsibilities": ["Develop security strategy", "Report to board", "Manage security budget", "Lead security organization"]
    }
  ]
};

// Global variables
let filteredJobs = jobsData.jobs;
let currentSelectedJob = null;

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
    
    showLoading();
    setTimeout(() => {
        hideLoading();
        renderJobs(filteredJobs);
        updateResultsCount();
        setupEventListeners();
    }, 500);
});

// Event Listeners Setup
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', handleClearSearch);
    }
    
    // Modal event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }
}

// Search functionality
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query.length > 0) {
        clearSearchBtn.classList.add('visible');
        filteredJobs = jobsData.jobs.filter(job => 
            job.company.toLowerCase().includes(query) ||
            job.position.toLowerCase().includes(query)
        );
    } else {
        clearSearchBtn.classList.remove('visible');
        filteredJobs = jobsData.jobs;
    }
    
    renderJobs(filteredJobs);
    updateResultsCount();
}

function handleClearSearch(event) {
    event.preventDefault();
    event.stopPropagation();
    clearSearch();
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.classList.remove('visible');
        filteredJobs = jobsData.jobs;
        renderJobs(filteredJobs);
        updateResultsCount();
        searchInput.focus();
    }
}

// Job rendering
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
    card.setAttribute('aria-label', `View details for ${job.position} at ${job.company}`);
    card.setAttribute('data-job-id', job.id);
    
    const employmentRateClass = job.employmentRate.toLowerCase().replace(' ', '-');
    
    card.innerHTML = `
        <div class="job-card-header">
            <div class="job-info">
                <h3 class="job-title">${job.position}</h3>
                <p class="job-company">${job.company}</p>
            </div>
            <span class="employment-rate employment-rate--${employmentRateClass}">
                ${job.employmentRate}
            </span>
        </div>
        
        <p class="job-location">📍 ${job.location}</p>
        
        <div class="job-details">
            <div class="job-detail">
                <span class="job-detail-label">Salary</span>
                <span class="job-detail-value job-salary">${job.salary}</span>
            </div>
            <div class="job-detail">
                <span class="job-detail-label">Experience</span>
                <span class="job-detail-value">${job.experience}</span>
            </div>
            <div class="job-detail">
                <span class="job-detail-label">Level</span>
                <span class="job-detail-value">${job.authority}</span>
            </div>
            <div class="job-detail">
                <span class="job-detail-label">Rate</span>
                <span class="job-detail-value">${job.employmentRate}</span>
            </div>
        </div>
        
        <div class="job-actions">
            <button class="btn--apply" data-job-id="${job.id}" aria-label="Apply for ${job.position}">
                Apply Now
            </button>
        </div>
    `;
    
    // Add click event for opening skills modal
    card.addEventListener('click', function(e) {
        // Don't open skills modal if apply button was clicked
        if (!e.target.classList.contains('btn--apply')) {
            e.preventDefault();
            e.stopPropagation();
            openSkillsModal(job.id);
        }
    });
    
    // Add keyboard support
    card.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openSkillsModal(job.id);
        }
    });
    
    // Add apply button event listener
    const applyBtn = card.querySelector('.btn--apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openApplyModal(job.id);
        });
    }
    
    return card;
}

// Modal functionality
function openSkillsModal(jobId) {
    const job = jobsData.jobs.find(j => j.id === jobId);
    if (!job || !skillsModal) return;
    
    currentSelectedJob = job;
    
    // Populate modal content
    const modalJobTitle = document.getElementById('modalJobTitle');
    const modalCompany = document.getElementById('modalCompany');
    const modalPosition = document.getElementById('modalPosition');
    const modalLocation = document.getElementById('modalLocation');
    const modalSalary = document.getElementById('modalSalary');
    const modalExperience = document.getElementById('modalExperience');
    const modalEmploymentRate = document.getElementById('modalEmploymentRate');
    const modalAuthority = document.getElementById('modalAuthority');
    
    if (modalJobTitle) modalJobTitle.textContent = `${job.position} - ${job.company}`;
    if (modalCompany) modalCompany.textContent = job.company;
    if (modalPosition) modalPosition.textContent = job.position;
    if (modalLocation) modalLocation.textContent = job.location;
    if (modalSalary) modalSalary.textContent = job.salary;
    if (modalExperience) modalExperience.textContent = job.experience;
    if (modalEmploymentRate) modalEmploymentRate.textContent = job.employmentRate;
    if (modalAuthority) modalAuthority.textContent = job.authority;
    
    // Skills
    const skillsContainer = document.getElementById('modalSkills');
    if (skillsContainer) {
        skillsContainer.innerHTML = '';
        job.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });
    }
    
    // Certifications
    const certsContainer = document.getElementById('modalCertifications');
    if (certsContainer) {
        certsContainer.innerHTML = '';
        job.certifications.forEach(cert => {
            const certTag = document.createElement('span');
            certTag.className = 'cert-tag';
            certTag.textContent = cert;
            certsContainer.appendChild(certTag);
        });
    }
    
    // Responsibilities
    const responsibilitiesContainer = document.getElementById('modalResponsibilities');
    if (responsibilitiesContainer) {
        responsibilitiesContainer.innerHTML = '';
        job.responsibilities.forEach(responsibility => {
            const li = document.createElement('li');
            li.textContent = responsibility;
            responsibilitiesContainer.appendChild(li);
        });
    }
    
    // Show modal
    skillsModal.classList.remove('hidden');
    skillsModal.setAttribute('tabindex', '0');
    skillsModal.focus();
    document.body.style.overflow = 'hidden';
}

function closeSkillsModal() {
    if (skillsModal) {
        skillsModal.classList.add('hidden');
        document.body.style.overflow = '';
        currentSelectedJob = null;
    }
}

function openApplyModal(jobId = null) {
    const job = jobId ? jobsData.jobs.find(j => j.id === jobId) : currentSelectedJob;
    if (!job || !applicationModal) return;
    
    // Close skills modal if open
    if (skillsModal && !skillsModal.classList.contains('hidden')) {
        closeSkillsModal();
    }
    
    // Populate application modal
    const applyJobTitle = document.getElementById('applyJobTitle');
    const applyCompany = document.getElementById('applyCompany');
    const applyLocation = document.getElementById('applyLocation');
    const applySalary = document.getElementById('applySalary');
    
    if (applyJobTitle) applyJobTitle.textContent = job.position;
    if (applyCompany) applyCompany.textContent = job.company;
    if (applyLocation) applyLocation.textContent = job.location;
    if (applySalary) applySalary.textContent = job.salary;
    
    // Clear form
    const form = document.getElementById('applicationForm');
    if (form) {
        form.reset();
    }
    
    // Show modal
    applicationModal.classList.remove('hidden');
    applicationModal.setAttribute('tabindex', '0');
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = document.getElementById('applicantName');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function closeApplicationModal() {
    if (applicationModal) {
        applicationModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function submitApplication() {
    const form = document.getElementById('applicationForm');
    if (!form) return;
    
    // Basic validation
    const requiredFields = ['applicantName', 'applicantEmail', 'applicantPhone', 'applicantExperience'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = 'var(--color-error)';
            isValid = false;
        } else if (field) {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailField = document.getElementById('applicantEmail');
    if (emailField) {
        const email = emailField.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailField.style.borderColor = 'var(--color-error)';
            alert('Please enter a valid email address.');
            return;
        }
    }
    
    // Show success message
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        alert('Application submitted successfully! We will contact you soon.');
        closeApplicationModal();
    }, 1500);
}

// Keyboard event handling
function handleKeyPress(event) {
    if (event.key === 'Escape') {
        if (applicationModal && !applicationModal.classList.contains('hidden')) {
            closeApplicationModal();
        } else if (skillsModal && !skillsModal.classList.contains('hidden')) {
            closeSkillsModal();
        }
    }
}

// Utility functions
function updateResultsCount() {
    if (!resultsCount) return;
    const count = filteredJobs.length;
    const jobText = count === 1 ? 'job' : 'jobs';
    resultsCount.textContent = `${count} ${jobText} found`;
}

function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

// Handle form submission
function handleApplicationSubmit(event) {
    event.preventDefault();
    submitApplication();
}

// Export functions for global access (ensure they're available on window object)
window.openSkillsModal = openSkillsModal;
window.closeSkillsModal = closeSkillsModal;
window.openApplyModal = openApplyModal;
window.closeApplicationModal = closeApplicationModal;
window.submitApplication = submitApplication;
window.clearSearch = clearSearch;