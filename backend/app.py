import os
import json
import datetime
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import PyPDF2 as pdf
import docx  # <--- NEW LIBRARY
from dotenv import load_dotenv
from pymongo import MongoClient
from io import BytesIO

load_dotenv()

app = Flask(__name__)
# Allow all domains (Vercel, Localhost, etc.) to access the API
CORS(app, resources={r"/*": {"origins": "*"}})

# --- CONFIGURATION ---
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

try:
    mongo_client = MongoClient(os.getenv("MONGO_URI"))
    db = mongo_client['resume_db']
    collection = db['analyses']
    print("✅ MongoDB Connected Successfully")
except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")

# --- HELPER FUNCTIONS ---
def get_gemini_response(text, jd):
    model = genai.GenerativeModel('gemini-flash-latest')
    prompt = f"""
    Act as an ATS (Applicant Tracking System).
    Job Description: {jd}
    Resume Text: {text}
    
    Analyze the match. Output ONLY valid JSON in this format:
    {{
        "match_percentage": "85",
        "missing_keywords": ["Skill1", "Skill2"],
        "summary": "Brief summary here."
    }}
    """
    response = model.generate_content(prompt)
    return response.text

# --- UPDATED TEXT EXTRACTOR (PDF + DOCX) ---
def extract_text(file, filename):
    text = ""
    try:
        if filename.endswith('.pdf'):
            reader = pdf.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
        
        elif filename.endswith('.docx'):
            doc = docx.Document(file)
            for para in doc.paragraphs:
                text += para.text + "\n"
        
        else:
            return "Unsupported file format"
            
    except Exception as e:
        print(f"Extraction Error: {e}")
        return ""
        
    return text

def upload_to_s3(file, filename):
    try:
        bucket = os.getenv("AWS_BUCKET_NAME")
        # Auto-detect content type
        content_type = 'application/pdf' if filename.endswith('.pdf') else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        
        s3_client.upload_fileobj(
            file, 
            bucket, 
            filename,
            ExtraArgs={'ContentType': content_type}
        )
        region = os.getenv("AWS_REGION")
        return f"https://{bucket}.s3.{region}.amazonaws.com/{filename}"
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        return None

# --- ROUTES ---
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        jd = request.form['jd']
        resume_file = request.files['resume']
        original_filename = resume_file.filename
        
        # 1. Reset file pointer & Read
        resume_file.seek(0)
        file_content = resume_file.read()
        
        if len(file_content) == 0:
            return jsonify({"error": "Empty file"}), 400

        # 2. Make copies
        file_for_aws = BytesIO(file_content)
        file_for_text = BytesIO(file_content)
        
        # 3. AWS Upload
        timestamp_name = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{original_filename}"
        print("Uploading to AWS...")
        file_url = upload_to_s3(file_for_aws, timestamp_name)
        
        # 4. Extract Text (Now supports DOCX)
        print("Extracting text...")
        text = extract_text(file_for_text, original_filename) # Pass filename to check extension
        
        if not text:
            return jsonify({"error": "Could not extract text. File might be empty or scanned image."}), 400

        # 5. Gemini Analysis
        print("Analyzing with Gemini...")
        ai_response = get_gemini_response(text, jd)
        clean_json = ai_response.replace('```json', '').replace('```', '').strip()
        data = json.loads(clean_json)
        
        # 6. Save to DB
        collection.insert_one({
            "jd": jd[:50] + "...",
            "score": data.get("match_percentage"),
            "missing": data.get("missing_keywords"),
            "url": file_url,
            "date": datetime.datetime.utcnow()
        })
        
        return jsonify({"message": "Success", "data": data, "url": file_url})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    data = list(collection.find().sort("date", -1).limit(5))
    for item in data:
        item['_id'] = str(item['_id'])
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)