# Task Plan
## Phases
- [ ] **Phase 1: Blueprint & Architecture** (Current)
    - [x] Discovery Questions
    - [x] Data Schema (`gemini.md`)
    - [ ] **User Action**: Provide the specific "Prompt Template".
    - [ ] **Approve**: Final Blueprint.
- [ ] **Phase 2: Foundation (Backend)**
    - [ ] Set up Python environment (`virutalenv`).
    - [ ] Install dependencies (`ollama`, `fastapi`, `uvicorn`).
    - [ ] Create `server.py` with `/generate` endpoint.
    - [ ] Implement `LLMService` to talk to Ollama `llama3.2`.
- [ ] **Phase 3: Experience (Frontend)**
    - [ ] Create `index.html` with Chat UI structure.
    - [ ] Create `style.css` (Premium aesthetics: Dark mode, glassmorphism).
    - [ ] Create `app.js` to handle chat state and API calls.
- [ ] **Phase 4: Integration & Polish**
    - [x] Connect Frontend to Backend.
    - [x] Validate JSON parsing and error handling.
    - [x] Optimize prompts (Jira Task & PIM Context).
    - [x] Implement Table Format & Excel (CSV) Export.
    - [x] Final UI Polish (Premium Glassmorphism, Priority Badges).

## Goals
- Build a local, privacy-first Jira Test Case Generator for PIM software.
- Use `llama3.2` via Ollama with strict Anti-Hallucination rules.
- Deliver a premium, table-based experience with Excel export capabilities.

## Checklists
- [x] **Ollama Running**: Verify `llama3.2` is pulled and running.
- [x] **Jira Support**: Can parse Jira Task IDs and generate "PIM-XXXX" titles.
- [x] **Table UI**: Renders professional tables with prioritized badges.
- [x] **Export Ready**: Verified CSV export for test management tools.

