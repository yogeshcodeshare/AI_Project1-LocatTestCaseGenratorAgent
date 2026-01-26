from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import GenerateRequest, TestGenerationResponse
from backend.services.llm_service import LLMService
import uvicorn

app = FastAPI(title="Local LLM Test Case Generator")

# Allow CORS (Critical for frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LLMService()

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Ollama Test Generator"}

@app.post("/generate", response_model=TestGenerationResponse)
async def generate_tests(request: GenerateRequest):
    try:
        response = llm_service.generate_test_cases(request.prompt, request.template)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
