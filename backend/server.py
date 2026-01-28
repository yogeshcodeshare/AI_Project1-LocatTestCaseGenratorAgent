from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import GenerateRequest, TestGenerationResponse, Project, DeduplicationResponse
from backend.services.llm_service import LLMService
import uvicorn
import json
import os
from typing import List

app = FastAPI(title="Test case Generator with Local LLM")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECTS_FILE = "projects.json"
llm_service = LLMService()

def load_projects():
    if not os.path.exists(PROJECTS_FILE):
        default_proj = Project(id="default", name="Default Project", description="General PIM Testing")
        save_projects([default_proj])
        return [default_proj]
    with open(PROJECTS_FILE, "r") as f:
        data = json.load(f)
        return [Project(**p) for p in data]

def save_projects(projects: List[Project]):
    with open(PROJECTS_FILE, "w") as f:
        json.dump([p.model_dump() for p in projects], f, indent=4)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Test case Generator"}

@app.get("/projects", response_model=List[Project])
async def get_projects():
    return load_projects()

@app.post("/projects")
async def create_project(project: Project):
    projects = load_projects()
    # Update if exists, else add
    projects = [p for p in projects if p.id != project.id]
    projects.append(project)
    save_projects(projects)
    return project

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    projects = load_projects()
    projects = [p for p in projects if p.id != project_id]
    save_projects(projects)
    return {"status": "success"}

@app.post("/generate", response_model=TestGenerationResponse)
async def generate_tests(request: GenerateRequest):
    try:
        projects = load_projects()
        current_project = next((p for p in projects if p.id == request.project_id), None)
        
        project_context = ""
        if current_project:
            project_context = f"Project Name: {current_project.name}\nProject Description: {current_project.description}\nSpecific Rules: {current_project.rules}\n"
            
        print(f"🚀 Processing request for project: {request.project_id} with {len(request.attachments)} attachments")
        response = llm_service.generate_test_cases(request.prompt, request.template, project_context, request.attachments)
        return response
    except Exception as e:
        import traceback
        print("❌ CRITICAL BACKEND ERROR:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")

@app.post("/deduplicate", response_model=DeduplicationResponse)
async def deduplicate_cases(test_cases: List[dict]):
    try:
        response = llm_service.deduplicate_test_cases(test_cases)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
