import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv() # Load your API Key

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print(f"--- Checking models for Key ending in ...{api_key[-4:]} ---")

try:
    print("Available Models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")