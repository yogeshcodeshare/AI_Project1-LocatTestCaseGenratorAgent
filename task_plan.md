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
    - [ ] Connect Frontend to Backend.
    - [ ] Validate JSON parsing and error handling.
    - [ ] Optimize prompts (Integrate User's Template).
    - [ ] Final UI Polish (Animations, Responsive layout).

## Goals
- Build a local, privacy-first Test Case Generator.
- Use `llama3.2` via Ollama.
- Deliver a premium "Chat UI" experience in the browser.

## Checklists
- [ ] **Ollama Running**: Verify `llama3.2` is pulled and running.
- [ ] **Backend Healthy**: `/health` endpoint returns 200.
- [ ] **UI Functional**: Can send text and receive structured test cases.

