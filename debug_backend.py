from backend.services.llm_service import LLMService
import sys

def debug_llm():
    print("🐞 Debugging LLM Service...")
    service = LLMService()
    try:
        response = service.generate_test_cases("Login page with 2FA")
        print("✅ Success!")
        print(response)
    except Exception as e:
        print(f"❌ Failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_llm()
