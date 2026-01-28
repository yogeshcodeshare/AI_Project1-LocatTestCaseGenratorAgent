from pydantic import BaseModel, field_validator, BeforeValidator
from typing import List, Optional, Union, Any
from typing_extensions import Annotated

def coerce_to_string(v: Any) -> str:
    if v is None:
        return "N/A"
    if isinstance(v, list):
        return "\n".join([coerce_to_string(i) for i in v])
    if isinstance(v, dict):
        # Try to find a primary description field
        for key in ['description', 'text', 'value', 'details', 'step_description', 'data']:
            if key in v and v[key]:
                return str(v[key])
        # Otherwise format as "Key: Value"
        return ", ".join([f"{k}: {val}" for k, val in v.items() if val])
    return str(v)

def coerce_to_list_strings(v: Any) -> List[str]:
    if not v:
        return []
    if isinstance(v, str):
        return [line.strip() for line in v.split('\n') if line.strip()]
    if isinstance(v, list):
        processed = []
        for item in v:
            if isinstance(item, dict):
                # Extract text from common dictionary fields
                text = item.get('step_description') or item.get('description') or item.get('text') or str(item)
                processed.append(str(text))
            else:
                processed.append(str(item))
        return processed
    return [str(v)]

class TestCase(BaseModel):
    sr_no: Optional[Annotated[Union[str, int], BeforeValidator(str)]] = None
    id: Annotated[Union[str, int], BeforeValidator(str)]
    title: str
    test_scenario: str
    description: str
    priority: str
    steps: Annotated[List[Any], BeforeValidator(coerce_to_list_strings)]
    test_data: Annotated[str, BeforeValidator(coerce_to_string)] = "N/A"
    expected_result: Annotated[Union[str, dict], BeforeValidator(coerce_to_string)]


class TestGenerationResponse(BaseModel):
    verified_facts: List[str] = []
    missing_information: List[str] = []
    test_cases: List[TestCase]
    self_validation: str = ""

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    rules: Optional[str] = "Follow standard Anti-Hallucination rules."

class Attachment(BaseModel):
    filename: str
    content_type: str
    data: str # Base64 encoded content

class GenerateRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = "default"
    template: Optional[str] = None
    attachments: Optional[List[Attachment]] = []

class DuplicateResult(BaseModel):
    tc1_id: str
    tc2_id: str
    similarity_score: float # 0 to 1
    analysis: str
    suggested_action: str # "Merge", "Delete TC2", "Keep Both"

class DeduplicationResponse(BaseModel):
    duplicates: List[DuplicateResult]
    summary: str
