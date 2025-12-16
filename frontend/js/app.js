import { api } from './api.js';

// State
let jds = [];
let currentView = 'candidate';

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const jdListEl = document.getElementById('jd-list');
const jdCountEl = document.getElementById('jd-count');
const addJdBtn = document.getElementById('add-jd-btn');
const jdUploadForm = document.getElementById('jd-upload-form');
const submitJdBtn = document.getElementById('submit-jd-btn');
const resumeForm = document.getElementById('resume-form');
const resultContainer = document.getElementById('result-container');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('resume-file');

// Initialization
async function init() {
    setupNavigation();
    setupForms();
    await loadJDs();
}

// Navigation
function setupNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const viewName = btn.dataset.view;
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(`${viewName}-view`).classList.remove('hidden');
        });
    });
}

// Forms
function setupForms() {
    // JD Management
    addJdBtn.addEventListener('click', () => {
        jdUploadForm.classList.toggle('hidden');
    });

    submitJdBtn.addEventListener('click', async () => {
        const title = document.getElementById('jd-title').value;
        const text = document.getElementById('jd-text').value;
        const file = document.getElementById('jd-file').files[0];

        if (!title || (!text && !file)) {
            alert('Please provide a title and either text or a file.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        if (file) formData.append('file', file);
        if (text) formData.append('text', text);

        try {
            submitJdBtn.innerText = 'Uploading...';
            await api.uploadJD(formData);
            alert('JD Uploaded Successfully!');
            jdUploadForm.classList.add('hidden');
            await loadJDs();
        } catch (e) {
            alert(e.message);
        } finally {
            submitJdBtn.innerText = 'Upload JD';
        }
    });

    // Resume Drop Area
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            document.querySelector('.file-msg').innerText = fileInput.files[0].name;
        }
    });

    // Resume Submission
    resumeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) {
            alert('Please upload a resume.');
            return;
        }

        // Check if JDs exist
        if (jds.length === 0) {
            alert('No Job Descriptions found. Please ask admin to upload one.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);
        // Optional: append specific JD ID if selected, otherwise backend matches best
        // formData.append('jd_id', selectedJdId); 

        try {
            const btn = resumeForm.querySelector('.submit-btn');
            btn.innerText = 'Analyzing... (Gemini 2.5 is thinking)';
            btn.disabled = true;

            const result = await api.screenResume(formData);
            renderResult(result);
        } catch (e) {
            alert('Screening failed: ' + e.message);
        } finally {
            resumeForm.querySelector('.submit-btn').innerText = 'Evaluate Resume';
            resumeForm.querySelector('.submit-btn').disabled = false;
        }
    });
}

// Data Handling
async function loadJDs() {
    try {
        jds = await api.getJDs();
        renderJdList();
        jdCountEl.innerText = jds.length;
    } catch (e) {
        console.error('Failed to load JDs', e);
    }
}

function renderJdList() {
    jdListEl.innerHTML = '';
    jds.forEach(jd => {
        const div = document.createElement('div');
        div.className = 'list-item glass-panel';
        div.style.marginBottom = '10px';
        div.style.padding = '10px';
        div.innerHTML = `
            <strong>${jd.metadata.title}</strong>
            <span style="font-size: 0.8em; color: gray;">ID: ${jd.id.substring(0, 8)}...</span>
        `;
        jdListEl.appendChild(div);
    });
}

function renderResult(data) {
    resultContainer.classList.remove('hidden');

    // Safety check for keys
    const score = data.overall_score || 0;
    const recommendation = data.recommendation || 'N/A';
    const summary = data.fit_summary || 'No summary provided.';
    const strengths = data.strengths || [];
    const gaps = data.gaps || [];

    resultContainer.innerHTML = `
        <div class="glass-panel result-card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3>Analysis Result</h3>
                    <p class="text-muted">Job: ${data.jd_title}</p>
                    <p class="text-muted">ID: ${data.anonymized_id}</p>
                </div>
                <div style="text-align: right;">
                    <div class="score-badge" style="color: ${getColorForScore(score)}">${score}%</div>
                    <div class="tag">${recommendation}</div>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <h4>Fit Summary</h4>
                <p>${summary}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <h4 style="color: #6ee7b7;">Strengths</h4>
                    <ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
                <div>
                    <h4 style="color: #fbbf24;">Gaps / Suggestions</h4>
                    <ul>${gaps.map(g => `<li>${g}</li>`).join('')}</ul>
                </div>
            </div>

            <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
                 <strong>Fairness Audit:</strong> ${data.bias_audit || 'Pass'}
            </div>
        </div>
    `;

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function getColorForScore(score) {
    if (score >= 85) return '#10b981'; // Green
    if (score >= 70) return '#3b82f6'; // Blue
    if (score >= 50) return '#fbbf24'; // Yellow
    return '#ef4444'; // Red
}

// Run
init();
