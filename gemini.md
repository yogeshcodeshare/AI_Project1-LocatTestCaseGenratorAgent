# Project Constitution (gemini.md)

## Data Schemas

### TestCase
```json
{
  "id": "string (unique identifier, e.g., TC-001)",
  "title": "string (concise summary of the test)",
  "description": "string (purpose of the test)",
  "preconditions": "string (setup required before testing)",
  "steps": [
    "string (step 1)",
    "string (step 2)",
    "..."
  ],
  "expected_result": "string (what should happen)",
  "priority": "string (critical | high | medium | low)"
}
```

### GeneratorConfig
```json
{
  "model_name": "llama3.2",
  "temperature": 0.7,
  "system_prompt": "You are a QA automation expert. Generate detailed test cases based on the user's description. Return strictly valid JSON."
}
```

## Behavioral Rules
1.  **Strict JSON**: The system must enforce valid JSON output from Ollama using `format='json'`.
2.  **No Hallucinations**: If input is vague, ask for clarification (in the UI) rather than guessing logic.
3.  **Template-Based**: The prompt sent to Ollama must use the defined "Template" (to be provided by user) to ensure consistency.

## Maintenance Log
| Date | Event | Action | Status |
| :--- | :--- | :--- | :--- |
| 2026-01-26 | Project Initialization | Scaffolding `backend/`, `frontend/` | ✅ Complete |
| 2026-01-26 | Model Handshake | Pulled `llama3.2` model | ✅ Complete |
| 2026-01-26 | Backend Implementation | Created FastAPI server + Parsers | ✅ Complete |
| 2026-01-26 | Frontend Implementation | Built Chat UI (Dark Mode) | ✅ Complete |
| 2026-01-26 | Integration Test | Verified e2e flow (Login w/ 2FA) | ✅ Complete |
| 2026-01-26 | Deployment | Pushed to GitHub | ✅ Complete |


