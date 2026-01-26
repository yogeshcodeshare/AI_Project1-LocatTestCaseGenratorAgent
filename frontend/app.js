const messagesContainer = document.getElementById('messages');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');

const API_URL = 'http://localhost:8000/generate';

function addMessage(content, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;

    if (type === 'system' && typeof content === 'object') {
        // Render structured Test Cases
        div.innerHTML = renderTestCases(content);
    } else {
        div.textContent = content;
    }

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderTestCases(data) {
    if (!data.test_cases || data.test_cases.length === 0) {
        return "No test cases generated.";
    }

    return data.test_cases.map(tc => `
        <div class="tc-card">
            <div class="tc-header">
                <div>
                    <span class="tc-id">${tc.id}</span>
                    <span class="tc-title">${tc.title}</span>
                </div>
                <span class="tc-priority">${tc.priority}</span>
            </div>
            <p style="margin: 5px 0; font-style: italic;">${tc.description}</p>
            <div class="tc-steps">
                <strong>Steps:</strong>
                <ol>
                    ${tc.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            <p style="margin-top: 5px;"><strong>Expected:</strong> ${tc.expected_result}</p>
        </div>
    `).join('');
}

async function handleGenerate() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    addMessage(prompt, 'user');
    promptInput.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Generating...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        addMessage(data, 'system');

    } catch (error) {
        console.error('Error:', error);
        addMessage(`Error: ${error.message}. Is the backend running?`, 'system');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Generate';
    }
}

sendBtn.addEventListener('click', handleGenerate);

promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
    }
});
