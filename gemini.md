# Project Constitution (gemini.md)

## Data Schemas

### TestCase
```json
{
  "sr_no": "string (sequential number)",
  "id": "string (Jira ID, e.g., PIM-001)",
  "title": "string (starts with Jira ID and Verify/Validate)",
  "test_scenario": "string (broad category of testing)",
  "description": "string (detailed point-wise explanation)",
  "priority": "string (Blocker | Highest | High | Normal | Low)",
  "steps": ["string (step 1)", "string (step 2)"],
  "test_data": "string (input values for the test)",
  "expected_result": "string (detailed success criteria)"
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
2.  **Anti-Hallucination**: Follow the strict rules defined in `QA Rule Checklist/Anti_Hallucination_Rules.md`.
    - DO NOT invent features or APIs.
    - If information is missing, respond with "Insufficient information to determine."
    - Label inferred details as "Inference (low confidence)".
3.  **QA Verification**: All generated test cases must be verifiable against the `QA Rule Checklist/LLM_QA_Verification_Checklist.md`.
4.  **Template-Based**: The prompt sent to Ollama must use the defined "Template" (to be provided by user) to ensure consistency.

## QA & Verification Reference
- **Anti-Hallucination Standards**: [See Rules](./QA%20Rule%20Checklist/Anti_Hallucination_Rules.md)
- **Verification Checklist**: [See Checklist](./QA%20Rule%20Checklist/LLM_QA_Verification_Checklist.md)

## Maintenance Log
| Date | Event | Action | Status |
| :--- | :--- | :--- | :--- |
| 2026-01-26 | Project Initialization | Scaffolding `backend/`, `frontend/` | ✅ Complete |
| 2026-01-26 | Model Handshake | Pulled `llama3.2` model | ✅ Complete |
| 2026-01-26 | Backend Implementation | Created FastAPI server + Parsers | ✅ Complete |
| 2026-01-26 | Frontend Implementation | Built Chat UI (Dark Mode) | ✅ Complete |
| 2026-01-26 | Integration Test | Verified e2e flow (Login w/ 2FA) | ✅ Complete |
| 2026-01-26 | Deployment | Pushed to GitHub | ✅ Complete |
| 2026-01-28 | QA Alignment | Integrated Anti-Hallucination & QA Checklists | ✅ Complete |
| 2026-01-28 | Jira Integration | PIM/Jira Table Format & Excel Export | ✅ Complete |


