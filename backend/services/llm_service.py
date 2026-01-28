import ollama
import json
import base64
import io
from typing import List, Optional
from backend.models import TestCase, TestGenerationResponse, DeduplicationResponse, Attachment
try:
    import fitz  # PyMuPDF
    import docx
    from PIL import Image
except ImportError:
    pass

MODEL_NAME = "llama3.2"
VISION_MODEL = "llama3.2-vision" # We'll try to use this for images

class LLMService:
    def __init__(self):
        # Verify core model on startup
        if not self._ensure_model_available(MODEL_NAME):
            print(f"📥 Pulling core model {MODEL_NAME}...")
            try:
                ollama.pull(MODEL_NAME)
            except:
                pass

    def _ensure_model_available(self, model: str) -> bool:
        """Checks if the required model is ready in Ollama."""
        try:
            res = ollama.list()
            model_list = res.get('models', [])
            for m in model_list:
                m_name = getattr(m, 'model', None) or (m.get('name') if isinstance(m, dict) else "")
                if m_name and m_name.startswith(model):
                    return True
            return False
        except Exception as e:
            print(f"⚠️ Could not verify model {model}: {e}")
            return False

    def pull_vision_model(self):
        """Starts pulling the vision model in the background if missing."""
        if not self._ensure_model_available(VISION_MODEL):
            print(f"📥 Vision model missing. Starting pull...")
            try:
                ollama.pull(VISION_MODEL)
            except:
                pass

    def _process_attachments(self, attachments: List[Attachment]) -> str:
        context = ""
        for att in attachments:
            try:
                # Use a smaller buffer for data
                file_data = base64.b64decode(att.data)
                
                if "pdf" in att.content_type:
                    doc = fitz.open(stream=file_data, filetype="pdf")
                    text = ""
                    for page in doc:
                        text += page.get_text()
                    context += f"\n--- Content from PDF: {att.filename} ---\n{text}\n"
                    
                elif "wordprocessingml" in att.content_type or att.filename.endswith(".docx"):
                    doc = docx.Document(io.BytesIO(file_data))
                    text = "\n".join([para.text for para in doc.paragraphs])
                    context += f"\n--- Content from Docx: {att.filename} ---\n{text}\n"
                    
                elif "text/plain" in att.content_type:
                    text = file_data.decode("utf-8")
                    context += f"\n--- Content from Text: {att.filename} ---\n{text}\n"
                    
                elif "image" in att.content_type:
                    print(f"📸 Image detected: {att.filename}. checking vision engine...")
                    if self._ensure_model_available(VISION_MODEL):
                        try:
                            resp = ollama.generate(
                                model=VISION_MODEL,
                                prompt="Describe this image in detail, focusing on UI elements, data fields, and functionality that would be relevant for a QA engineer writing test cases.",
                                images=[att.data]
                            )
                            description = resp.get('response', '')
                            context += f"\n--- Description of Image: {att.filename} ---\n{description}\n"
                        except Exception as ve:
                            print(f"⚠️ Vision analysis failed for {att.filename}: {ve}")
                            context += f"\n[Image Attachment: {att.filename} (Vision analysis skipped due to error)]\n"
                    else:
                        print(f"⚠️ Vision model {VISION_MODEL} not ready. Skipping image description.")
                        context += f"\n[Image Attachment: {att.filename} (Vision analysis skipped. Model still downloading...)]\n"
                        
            except Exception as e:
                print(f"❌ Error processing attachment {att.filename}: {e}")
                context += f"\n[Error reading attachment: {att.filename}]\n"
                
        return context

    def generate_test_cases(self, user_prompt: str, template: str = None, project_context: str = "", attachments: List[Attachment] = []) -> TestGenerationResponse:
        """
        Generates test cases using Ollama based on the provided prompt and optional template.
        """
        
        attachment_context = self._process_attachments(attachments)
        
        system_prompt = (
            "You are a Professional Senior QA SDET specializing in PIM (Product Information Management) core software.\n"
            "Your task is to generate highly professional, detailed test cases from Jira task inputs and provided context files.\n\n"
            "ISOLATION RULE: You must ONLY use the information provided for THIS project. Do not mix data from other projects.\n\n"
            f"{project_context}\n"
            f"FILE ATTACHMENT CONTEXT (extracted from user files/images):\n{attachment_context}\n\n"
            "INPUT EXPECTATIONS:\n"
            "- Jira Task ID (e.g., PIM-XXXX)\n"
            "- Description, Steps to Reproduce\n"
            "- Expected vs Actual Result\n"
            "- Acceptance Criteria (if given)\n\n"
            "OUTPUT RULES:\n"
            "1. Format: STRICT JSON as a list of test cases.\n"
            "2. Scenarios: Cover Positive, Negative, and Boundary/Corner cases.\n"
            "3. Title: MUST start with 'PIM-XXXX: ' (matching the input ID) and lead with 'Verify...' or 'Validate...'.\n"
            "4. Priority: MUST be one of: Blocker, Highest, High, Normal, Major, Minor, Low, Lowest.\n"
            "5. Test Steps: MUST be a list of plain strings. DO NOT use objects or dictionaries inside the steps list.\n"
            "6. Test Data: Provide clear, varied data in PLAIN ENGLISH. DO NOT use objects or JSON-style structures.\n"
            "7. Description: Point-wise explanation of the test purpose.\n\n"
            "JSON SCHEMA REQUIREMENT:\n"
            "Return a JSON object with: verified_facts (list), missing_information (list), test_cases (list), self_validation (string).\n"
            "Each test case MUST have: sr_no, id (Jira ID), title, test_scenario, description, priority, steps (List of Strings), test_data (String), expected_result (String)."
        )

        full_prompt = f"### JIRA TASK INPUT ###\n{user_prompt}\n\n"
        if template:
            full_prompt += f"### TEMPLATE PREFERENCE ###\n{template}\n\n"
            
        full_prompt += "Generate comprehensive professional test cases for the above Jira task in the required JSON format."

        print(f"🤖 Generating Jira-aligned test cases for {MODEL_NAME}...")
        
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
            print(f"📦 Raw LLM Response: {content[:200]}...")
            
            data = json.loads(content)
            
            # Normalization logic
            test_cases_raw = data.get("test_cases", [])
            if not isinstance(test_cases_raw, list):
                # Fallback if the LLM put the list somewhere else
                for val in data.values():
                    if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                        test_cases_raw = val
                        break
            
            validated_cases = [TestCase(**tc) for tc in test_cases_raw]
            
            return TestGenerationResponse(
                verified_facts=data.get("verified_facts", []),
                missing_information=data.get("missing_information", []),
                test_cases=validated_cases,
                self_validation=data.get("self_validation", "Passed internal check.")
            )

        except Exception as e:
            print(f"❌ Error in LLM generation: {e}")
            raise e

    def deduplicate_test_cases(self, test_cases: List[dict]) -> dict:
        """
        Analyzes a list of test cases for semantic duplicates and suggests merges.
        """
        system_prompt = (
            "You are a Senior QA Specialist. Your task is to perform SEMANTIC DEDUPLICATION on a list of test cases.\n"
            "Analyze titles, descriptions, and steps to find cases that test the same functionality.\n\n"
            "JSON SCHEMA REQUIREMENT:\n"
            "Return a JSON object with: duplicates (list), summary (string).\n"
            "Each duplicate item MUST have: tc1_id, tc2_id, similarity_score (0.0 to 1.0), analysis, suggested_action (Merge | Delete TC2 | Keep Both)."
        )

        user_prompt = f"Analyze the following test cases for duplicates:\n{json.dumps(test_cases, indent=2)}"

        try:
            print(f"🧠 AI is analyzing {len(test_cases)} test cases for deduplication...")
            response = ollama.chat(
                model=MODEL_NAME,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt},
                ],
                format='json',
            )
            
            content = response['message']['content']
            return json.loads(content)
        except Exception as e:
            print(f"❌ Error in LLM deduplication: {e}")
            raise e
