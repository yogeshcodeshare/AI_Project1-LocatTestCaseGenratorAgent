const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const fileUpload = document.getElementById('fileUpload');
const fileList = document.getElementById('fileList');
const projectSelect = document.getElementById('projectSelect');
const manageProjectsBtn = document.getElementById('manageProjectsBtn');
const projectModal = document.getElementById('projectModal');
const closeModal = document.getElementById('closeModal');
const saveProjectBtn = document.getElementById('saveProjectBtn');
const projectTableList = document.getElementById('projectTableList');
const projectDetails = document.getElementById('projectDetails');
const activityFeed = document.getElementById('activityFeed');
const refinerInput = document.getElementById('refinerInput');
const refineBtn = document.getElementById('refineBtn');
const refinerChat = document.getElementById('refinerChat');

// Deduplication Elements
const dedupeBtn = document.getElementById('dedupeBtn');
const dedupeModal = document.getElementById('dedupeModal');
const closeDedupeModal = document.getElementById('closeDedupeModal');
const duplicateList = document.getElementById('duplicateList');
const dedupeSummary = document.getElementById('dedupeSummary');

const API_BASE = 'http://localhost:8000';

let lastGeneratedData = null;
let attachedFiles = [];
let allProjects = [];
let currentProjectId = 'default';
let editingProjectId = null;

fileUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
        const base64Data = await fileToBase64(file);
        attachedFiles.push({
            filename: file.name,
            content_type: file.type,
            data: base64Data.split(',')[1], // Remove metadata prefix
            preview: file.type.startsWith('image/') ? base64Data : null
        });
    }
    renderAttachedFiles();
    fileUpload.value = ''; // Reset for next selection
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function renderAttachedFiles() {
    fileList.innerHTML = attachedFiles.map((file, index) => `
        <div class="file-item">
            ${file.preview ? `<img src="${file.preview}" class="file-thumb" />` : `<div class="file-thumb" style="display:flex;align-items:center;justify-content:center;font-size:12px">📄</div>`}
            <div class="file-name">${file.filename}</div>
            <div class="remove-file" onclick="removeAttachedFile(${index})">✕</div>
        </div>
    `).join('');
}

window.removeAttachedFile = (index) => {
    attachedFiles.splice(index, 1);
    renderAttachedFiles();
};

async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        allProjects = await response.json();
        renderProjectOptions();
        renderProjectList();
        updateProjectDetailsPanel();
    } catch (e) {
        console.error("Failed to fetch projects", e);
    }
}

function renderProjectOptions() {
    projectSelect.innerHTML = allProjects.map(p => `
        <option value="${p.id}" ${p.id === currentProjectId ? 'selected' : ''}>${p.name}</option>
    `).join('');
}

function renderProjectList() {
    projectTableList.innerHTML = allProjects.map(p => `
        <div class="project-item">
            <div class="project-item-info">
                <strong>${p.name}</strong>
                <span>${p.description || 'No description'}</span>
            </div>
            <div class="project-item-actions">
                <button onclick="editProject('${p.id}')" class="edit-btn">Edit</button>
                ${p.id !== 'default' ? `<button onclick="deleteProject('${p.id}')" class="delete-btn">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

function updateProjectDetailsPanel() {
    const p = allProjects.find(proj => proj.id === currentProjectId) || allProjects[0];
    if (p) {
        projectDetails.innerHTML = `
            <p><strong>Status:</strong> Local AI Ready</p>
            <p><strong>Project:</strong> ${p.name}</p>
            <p><strong>Context:</strong> ${p.description || 'N/A'}</p>
            <p><strong>Rules:</strong> Anti-Hallucination Active</p>
        `;
    }
}

function resetProjectForm() {
    document.getElementById('projName').value = '';
    document.getElementById('projDesc').value = '';
    document.getElementById('projRules').value = '';
    editingProjectId = null;
    saveProjectBtn.textContent = 'Save Project';
}

async function saveProject() {
    const name = document.getElementById('projName').value.trim();
    const desc = document.getElementById('projDesc').value.trim();
    const rules = document.getElementById('projRules').value.trim();

    if (!name) return alert("Project name is required");

    // Use existing ID if editing, otherwise generate new one
    const project = {
        id: editingProjectId || name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        description: desc,
        rules: rules
    };

    try {
        await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project)
        });
        resetProjectForm();
        await fetchProjects();
    } catch (e) {
        console.error("Save failed", e);
    }
}

window.deleteProject = async (id) => {
    if (!confirm("Are you sure? This delete only the configuration.")) return;
    try {
        await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
        if (currentProjectId === id) currentProjectId = 'default';
        await fetchProjects();
    } catch (e) {
        console.error("Delete failed", e);
    }
};

window.editProject = (id) => {
    const p = allProjects.find(proj => proj.id === id);
    if (p) {
        document.getElementById('projName').value = p.name;
        document.getElementById('projDesc').value = p.description;
        document.getElementById('projRules').value = p.rules;
        editingProjectId = p.id;
        saveProjectBtn.textContent = 'Update Project';
    }
};

function clearChat() {
    messagesContainer.innerHTML = `
        <div class="message system">
            Chat cleared. Switched to ${allProjects.find(p => p.id === currentProjectId)?.name || 'Default Project'}. Provide the Jira Task details to begin.
        </div>
    `;
    lastGeneratedData = null;
    exportCsvBtn.style.display = 'none';
    refinerInput.disabled = true;
    refineBtn.disabled = true;
    refinerChat.innerHTML = ''; // Clear refiner chat as well
}

manageProjectsBtn.onclick = () => {
    resetProjectForm();
    projectModal.style.display = 'block';
};
closeModal.onclick = () => projectModal.style.display = 'none';
saveProjectBtn.onclick = saveProject;

projectSelect.onchange = (e) => {
    currentProjectId = e.target.value;
    updateProjectDetailsPanel();
    clearChat(); // Isolate chat per project session
};

window.onclick = (event) => {
    if (event.target == projectModal) projectModal.style.display = "none";
};

// Initial Fetch
fetchProjects();

async function showActivityLog(steps) {
    activityFeed.style.display = 'flex';
    for (const step of steps) {
        activityFeed.innerHTML = `<span>⚙️</span> ${step}`;
        await new Promise(r => setTimeout(r, 1000));
    }
}

function autoExpand(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    // Handle overflow if max-height is reached
    if (textarea.scrollHeight > parseInt(window.getComputedStyle(textarea).maxHeight)) {
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
}

promptInput.addEventListener('input', function () { autoExpand(this); });
refinerInput.addEventListener('input', function () { autoExpand(this); });

function renderResults(data) {
    messagesContainer.innerHTML = ''; // Clear empty state

    // Add Verification Metadata
    let html = '';
    if (data.verified_facts?.length > 0 || data.missing_information?.length > 0) {
        html += '<div class="verification-meta">';
        if (data.verified_facts?.length > 0) {
            html += `
                <div class="verification-section facts">
                    <strong>✅ Verified Facts:</strong>
                    <ul>${data.verified_facts.map(f => `<li>${f}</li>`).join('')}</ul>
                </div>
            `;
        }
        if (data.missing_information?.length > 0) {
            html += `
                <div class="verification-section missing">
                    <strong>⚠️ Missing Information:</strong>
                    <ul>${data.missing_information.map(m => `<li>${m}</li>`).join('')}</ul>
                </div>
            `;
        }
        html += '</div>';
    }

    if (data.test_cases?.length > 0) {
        html += `
            <div class="tc-table-container">
                <table class="tc-table">
                    <thead>
                        <tr>
                            <th>Sr.</th>
                            <th>Test Case Title</th>
                            <th>Scenario</th>
                            <th>Description</th>
                            <th>Priority</th>
                            <th>Steps</th>
                            <th>Data</th>
                            <th>Expected Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.test_cases.map(tc => `
                            <tr>
                                <td>${tc.sr_no || '-'}</td>
                                <td><strong>${tc.title}</strong></td>
                                <td>${tc.test_scenario}</td>
                                <td>${tc.description}</td>
                                <td><span class="badge badge-${tc.priority.toLowerCase()}">${tc.priority}</span></td>
                                <td><ol style="padding-left:15px; margin:0">${tc.steps.map(s => `<li>${s}</li>`).join('')}</ol></td>
                                <td><code>${tc.test_data}</code></td>
                                <td>${tc.expected_result}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    if (data.self_validation) {
        html += `<div class="verification-section validation"><strong>🛡️ AI Validation:</strong> ${data.self_validation}</div>`;
    }

    messagesContainer.innerHTML = html;

    // Reset heights after render/clear
    autoExpand(promptInput);
    autoExpand(refinerInput);
}

async function handleGenerate() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    let finalPrompt = prompt;
    if (attachedFiles.length > 0) {
        const fileNames = attachedFiles.map(f => f.filename).join(', ');
        finalPrompt += `\n\n[Context from attached files: ${fileNames}]`;
    }

    messagesContainer.innerHTML = '<div class="empty-state"><h3>Generating...</h3></div>';
    sendBtn.disabled = true;
    exportCsvBtn.style.display = 'none';

    await showActivityLog([
        "Analyzing project context...",
        "Processing attached files & images...",
        "Identifying grounding facts...",
        "Generating professional test cases...",
        "Applying Anti-Hallucination rules..."
    ]);

    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: finalPrompt,
                project_id: currentProjectId,
                attachments: attachedFiles.map(({ filename, content_type, data }) => ({ filename, content_type, data }))
            })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        lastGeneratedData = data;
        renderResults(data);

        exportCsvBtn.style.display = 'block';
        refinerInput.disabled = false;
        refineBtn.disabled = false;
        addRefinerMessage("Test cases generated! Use this sidebar to refine them.", "system");

    } catch (error) {
        console.error('Error:', error);
        messagesContainer.innerHTML = `<div class="message system">Error: ${error.message}</div>`;
    } finally {
        sendBtn.disabled = false;
        activityFeed.style.display = 'none';
        promptInput.value = '';
        autoExpand(promptInput);
    }
}

async function handleRefine() {
    const instruction = refinerInput.value.trim();
    if (!instruction || !lastGeneratedData) return;

    addRefinerMessage(instruction, "user");
    refinerInput.value = '';
    refineBtn.disabled = true;

    await showActivityLog([
        "Analyzing refinement instructions...",
        "Updating test cases...",
        "Finalizing changes..."
    ]);

    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `Refine these test cases: ${instruction}\n\nExisting Data: ${JSON.stringify(lastGeneratedData.test_cases)}`,
                project_id: currentProjectId
            })
        });

        const data = await response.json();
        lastGeneratedData = data;
        renderResults(data);
        addRefinerMessage("Successfully refined!", "system");
    } catch (e) {
        addRefinerMessage("Error: " + e.message, "system");
    } finally {
        refineBtn.disabled = false;
        activityFeed.style.display = 'none';
        refinerInput.value = '';
        autoExpand(refinerInput);
    }
}

function addRefinerMessage(text, type) {
    const div = document.createElement('div');
    div.className = `refiner-msg ${type}`;
    div.style.marginBottom = '12px';
    div.style.padding = '10px';
    div.style.borderRadius = '8px';
    div.style.fontSize = '0.8rem';
    div.style.background = type === 'user' ? 'rgba(108, 92, 231, 0.1)' : 'rgba(255,255,255,0.05)';
    div.innerHTML = `<strong>${type === 'user' ? 'You' : 'AI'}:</strong> ${text}`;
    refinerChat.appendChild(div);
    refinerChat.scrollTop = refinerChat.scrollHeight;
}

function exportToCsv() {
    if (!lastGeneratedData || !lastGeneratedData.test_cases) return;

    const headers = ["Sr. No.", "Test Case Title", "Test Scenario", "Description", "Priority", "Test Steps", "Test Data", "Expected Result"];
    const rows = lastGeneratedData.test_cases.map(tc => [
        tc.sr_no || "",
        `"${tc.title.replace(/"/g, '""')}"`,
        `"${tc.test_scenario.replace(/"/g, '""')}"`,
        `"${tc.description.replace(/"/g, '""')}"`,
        tc.priority,
        `"${tc.steps.join('\n').replace(/"/g, '""')}"`,
        `"${tc.test_data.replace(/"/g, '""')}"`,
        `"${tc.expected_result.replace(/"/g, '""')}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TestGen_${currentProjectId}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

sendBtn.onclick = handleGenerate;
refineBtn.onclick = handleRefine;
exportCsvBtn.onclick = exportToCsv;

// Deduplication Logic
async function handleDeduplicate() {
    if (!lastGeneratedData || !lastGeneratedData.test_cases) return alert("Generate test cases first!");

    dedupeModal.style.display = 'block';
    duplicateList.innerHTML = '<div class="empty-state"><h3>AI is scanning for duplicates...</h3></div>';
    dedupeSummary.textContent = "Analyzing semantic similarity...";

    try {
        const response = await fetch(`${API_BASE}/deduplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastGeneratedData.test_cases)
        });

        const data = await response.json();
        renderDuplicates(data);
    } catch (e) {
        console.error("Deduplication failed", e);
        dedupeSummary.textContent = "Error: " + e.message;
    }
}

function renderDuplicates(data) {
    dedupeSummary.textContent = data.summary || "Analysis complete.";

    if (!data.duplicates || data.duplicates.length === 0) {
        duplicateList.innerHTML = '<div class="empty-state"><h3>✅ No semantic duplicates found.</h3><p>Your test suite is clean and unique.</p></div>';
        return;
    }

    duplicateList.innerHTML = data.duplicates.map(dup => {
        const tc1 = lastGeneratedData.test_cases.find(t => t.id === dup.tc1_id);
        const tc2 = lastGeneratedData.test_cases.find(t => t.id === dup.tc2_id);

        if (!tc1 || !tc2) return '';

        const simClass = dup.similarity_score > 0.8 ? 'sim-high' : 'sim-medium';

        return `
            <div class="comparison-pair">
                <div class="similarity-badge ${simClass}">
                    ${Math.round(dup.similarity_score * 100)}% Match
                </div>
                <div class="side-by-side">
                    <div class="tc-v-card">
                        <h4>Case A: ${tc1.id}</h4>
                        <p><strong>Title:</strong> ${tc1.title}</p>
                        <p><strong>Desc:</strong> ${tc1.description.substring(0, 100)}...</p>
                    </div>
                    <div class="tc-v-card">
                        <h4>Case B: ${tc2.id}</h4>
                        <p><strong>Title:</strong> ${tc2.title}</p>
                        <p><strong>Desc:</strong> ${tc2.description.substring(0, 100)}...</p>
                    </div>
                </div>
                <div class="diff-analysis">
                    <strong>AI Analysis:</strong> ${dup.analysis}
                    <br><br>
                    <strong>💡 AI Suggestion:</strong> <span style="color: var(--primary-color); font-weight:700">${dup.suggested_action}</span>
                </div>
            </div>
        `;
    }).join('');
}

dedupeBtn.onclick = handleDeduplicate;
closeDedupeModal.onclick = () => dedupeModal.style.display = 'none';

const leftCollapseBtn = document.getElementById('leftCollapseBtn');
const rightCollapseBtn = document.getElementById('rightCollapseBtn');
const projectsSidebar = document.querySelector('.projects-sidebar');
const refinerSidebar = document.querySelector('.refiner-sidebar');

const appWrapper = document.querySelector('.app-wrapper');

leftCollapseBtn.onclick = () => {
    projectsSidebar.classList.toggle('collapsed');
    appWrapper.classList.toggle('left-collapsed');
    leftCollapseBtn.textContent = projectsSidebar.classList.contains('collapsed') ? '▶' : '◀';
};

rightCollapseBtn.onclick = () => {
    refinerSidebar.classList.toggle('collapsed');
    appWrapper.classList.toggle('right-collapsed');
    rightCollapseBtn.textContent = refinerSidebar.classList.contains('collapsed') ? '◀' : '▶';
};

promptInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } };
refinerInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine(); } };
