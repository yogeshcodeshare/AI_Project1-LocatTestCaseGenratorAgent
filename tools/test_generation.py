import ollama
import sys

def test_generation():
    print("🧪 Testing LLM Generation (Handshake)...")
    try:
        model = "llama3.2"
        prompt = "Hello! Are you ready to generate test cases? Answer with one short sentence."
        
        print(f"📤 Sending prompt to {model}: '{prompt}'")
        response = ollama.generate(model=model, prompt=prompt)
        
        answer = response['response']
        print(f"📥 Received: {answer}")
        
        if answer:
            print("✅ Handshake Successful!")
            return True
        else:
            print("⚠️ Received empty response.")
            return False
            
    except Exception as e:
        print(f"❌ Handshake Failed.")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_generation()
