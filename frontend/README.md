# 🚀 AI Resume Insight

> **Next-Generation Resume Analyzer & Smart ATS**
>
> *Powered by Google Gemini AI, AWS S3, and MongoDB.*

[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Backend-Flask-green)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-forestgreen)](https://www.mongodb.com/)
[![AWS](https://img.shields.io/badge/Cloud-AWS%20S3-orange)](https://aws.amazon.com/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-purple)](https://deepmind.google/technologies/gemini/)

## 📋 Overview

**AI Resume Insight** is a full-stack Application Tracking System (ATS) simulator designed to help recruiters and candidates understand resume fit instantly. 

Unlike simple keyword matchers, this application uses **Generative AI (Google Gemini)** to deeply analyze the context of a resume against a job description. It calculates a compatibility score, identifies missing hard/soft skills, and provides constructive feedback—all in real-time.

---

## ✨ Key Features

- **🧠 AI-Powered Analysis:** Uses LLMs to understand resume context, not just keywords.
- **☁️ Cloud Storage:** Automatically uploads and hosts resume documents on **AWS S3**.
- **📊 Interactive Dashboard:** Visual match score with animated indicators.
- **🔍 Skill Gap Analysis:** Explicitly lists missing keywords and skills required for the role.
- **🌓 Dark/Light Mode:** Fully responsive UI with persistent theme preferences.
- **🗂️ History Tracking:** Saves all past scans to **MongoDB** for easy retrieval.
- **⚡ Drag & Drop:** Modern, intuitive file upload interface.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js:** Component-based UI architecture.
- **CSS3 Variables:** For dynamic theming (Dark/Light mode).
- **Axios:** For API communication.

### **Backend**
- **Python (Flask):** REST API development.
- **Google Generative AI:** For resume parsing and scoring.
- **Boto3:** For AWS S3 integration.
- **PyMongo:** For database interactions.

### **Infrastructure**
- **Database:** MongoDB Atlas (Cloud).
- **Storage:** AWS S3 Bucket.
- **Deployment:** Vercel (Frontend) + Render (Backend).

---

## ⚙️ System Architecture

1.  **Upload:** User uploads PDF/DOCX via React Frontend.
2.  **Storage:** Backend uploads the file to **AWS S3** and generates a secure URL.
3.  **Processing:** Text is extracted from the document using Python.
4.  **AI Analysis:** The extracted text + Job Description are sent to **Google Gemini**.
5.  **Result:** Gemini returns a JSON object (Score, Missing Skills, Summary).
6.  **Persistence:** Results are saved to **MongoDB** for history tracking.

---

## 🚀 Getting Started (Run Locally)

Follow these steps to run the project on your local machine.

### **1. Clone the Repository**
```bash
git clone [https://github.com/VINAYAGAM-N/AI-Resume-Insight.git](https://github.com/VINAYAGAM-N/AI-Resume-Insight.git)
cd AI-Resume-Insight

### 2. Backend Setup
Navigate to the `backend` folder and install dependencies.

```bash
cd backend
# Create virtual environment (Optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install requirements
```bash
pip install -r requirements.txt

#Configure Environment Variables: Create a .env file in the backend folder and add your keys:Code snippetGOOGLE_API_KEY=your_gemini_key
```bash
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-north-1
AWS_BUCKET_NAME=your_bucket_name
MONGO_URI=your_mongo_connection_string

#Run the Server:
```bash
python app.py
### 3. Frontend Setup
Open a new terminal and navigate to the frontend folder.Bashcd frontend
```bash
npm install
npm start

The application will launch at http://localhost:3000.
##📸 Screenshots
Light Mode DashboardAnalysis Result (Dark Mode)

