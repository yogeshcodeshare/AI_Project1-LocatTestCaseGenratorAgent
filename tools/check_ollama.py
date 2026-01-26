import ollama
import sys

def check_ollama_status():
    print("🔄 Checking Ollama connection...")
    try:
        # List models to verify connection and model availability
        models = ollama.list()
        print("✅ Ollama is running.")
        
        # Check for llama3.2
        available_models = [m['name'] for m in models['models']]
        print(f"📋 Available models: {available_models}")
        
        target_model = "llama3.2:latest" 
        # Note: ollama list often returns 'llama3.2:latest', we should check loosely
        if any("llama3.2" in m for m in available_models):
            print(f"✅ Target model 'llama3.2' found.")
        else:
            print(f"⚠️ Target model 'llama3.2' NOT found. You may need to run 'ollama pull llama3.2'")
            # Optional: try to pull? No, BLAST says "Verification". 
            
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Ollama. Is it running?")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = check_ollama_status()
    if not success:
        sys.exit(1)
