# SOP: Test Case Generation Logic

## Goal
Generate structured, detailed software test cases from a user's free-text description using a local LLM.

## Inputs
- **User Prompt**: String (The feature description or requirement).
- **Template** (Optional): A preferred structure or additional instructions.

## Logic
1.  **Validation**: Ensure User Prompt is not empty.
2.  **Prompt Engineering**:
    -   Construct a system prompt that enforces role (QA Expert).
    -   Inject the JSON schema definition to ensure the model understands the output format.
    -   Combine User Prompt and Config.
3.  **LLM Interaction**:
    -   Call Ollama `generate` or `chat` endpoint with `model='llama3.2'`.
    -   Set `format='json'`.
    -   Set `stream=False` for atomic processing.
4.  **Parsing & Validation**:
    -   Parse the returned JSON string.
    -   Validate against the `TestCase` Pydantic model.
    -   If validation fails, retry once with an error-correction prompt (optional for now).
5.  **Output**: Return the list of valid `TestCase` objects.

## Edge Cases
-   **Model Hallucination**: Model returns text preamble ("Here is the JSON..."). *Mitigation*: The `format='json'` flag usually handles this, but we must parse carefully.
-   **Ollama Down**: *Mitigation*: `LLMService` must raise a clear `503 Service Unavailable`.
-   **Empty/Garbage Input**: Return a polite error message.
