from pydantic import BaseModel, field_validator, BeforeValidator
from typing import List, Optional, Union, Any
from typing_extensions import Annotated

def coerce_to_string(v: Any) -> str:
    if isinstance(v, list):
        return "\n".join([str(i) for i in v])
    if isinstance(v, dict):
        return str(v)
    return str(v)

def coerce_to_list_strings(v: Any) -> List[str]:
    if isinstance(v, str):
        return [v]
    if isinstance(v, list):
        return [str(i) for i in v]
    return []

class TestCase(BaseModel):
    id: Annotated[Union[str, int], BeforeValidator(str)]
    title: str
    description: str
    preconditions: Optional[Annotated[Union[str, List[str]], BeforeValidator(coerce_to_string)]] = None
    steps: Annotated[List[Any], BeforeValidator(coerce_to_list_strings)]
    expected_result: Annotated[Union[str, dict], BeforeValidator(coerce_to_string)]
    priority: str


class TestGenerationResponse(BaseModel):
    test_cases: List[TestCase]

class GenerateRequest(BaseModel):
    prompt: str
    template: Optional[str] = None
