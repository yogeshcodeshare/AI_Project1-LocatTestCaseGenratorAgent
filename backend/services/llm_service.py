import ollama
import json
from typing import List
from backend.models import TestCase, TestGenerationResponse

MODEL_NAME = "llama3.2"

class LLMService:
    def generate_test_cases(self, user_prompt: str, template: str = None) -> TestGenerationResponse:
        """
        Generates test cases using Ollama based on the provided prompt and optional template.
        """
        
        system_prompt = (
            "You are a QA automation expert. Your goal is to generate detailed, structured test cases "
            "based on the user's requirement. "
            "You must return the response in strict JSON format matching the schema."
        )

        full_prompt = f"User Requirement: {user_prompt}\n"
        if template:
            full_prompt += f"\nFollow this template preference: {template}\n"
            
        full_prompt += "\nGenerate a list of test cases in JSON format with fields: id, title, description, preconditions, steps, expected_result, priority."

        print(f"🤖 Sending request to {MODEL_NAME}...")
        
        try:
            response = ollama.chat(
                model=MODEL_NAME,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': full_prompt},
                ],
                format='json',
            )
            
            content = response['message']['content']
            print(f"📦 Raw LLM Response: {content[:100]}...")
            
            # The model might return a list or a wrapper object. We need to handle both or guide it better.
            # Let's try to parse into our Pydantic model.
            
            data = json.loads(content)
            
            # Normalization logic: Handle if it returns a list directly or a dict with a key
            test_cases_list = []
            if isinstance(data, list):
                test_cases_list = data
            elif "test_cases" in data:
                test_cases_list = data["test_cases"]
            else:
                 # Try to find any list in values
                 for key, value in data.items():
                     if isinstance(value, list):
                         test_cases_list = value
                         break
            
            validated_cases = [TestCase(**tc) for tc in test_cases_list]
            return TestGenerationResponse(test_cases=validated_cases)

        except Exception as e:
            print(f"❌ Error in LLM generation: {e}")
            raise e
