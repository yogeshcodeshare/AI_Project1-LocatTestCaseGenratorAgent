# Findings
## Research
### Local Test Case Generation with Ollama
- **Approaches**:
    - **Direct API**: Use `ollama` Python library (`pip install ollama`) to send prompts to models like `codellama`, `llama3`, or `gemma`.
    - **Structured Output**: Ollama API supports `format='json'` and JSON schemas to enforce valid JSON output, which is critical for parsing test cases.
    - **DeepEval**: Existing framework for LLM evals, but might be overkill if we just want a generator.
- **Tools**:
    - Python is the primary language for orchestration.
    - `pydantic` can be used to define schemas and validate JSON output.
    - `unittest` or `pytest` can be used to run the generated tests if they are Python code. 

## Discoveries
- TBD

## Constraints
- TBD
