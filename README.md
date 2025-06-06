# LLM PDF Analyzer - Quick Setup

## Backend

cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create a .env file with your OpenAI key
OPENAI_API_KEY=sk-...

# Start the backend server
uvicorn main:app --reload

API will be available at: http://localhost:8000

---

## Frontend

cd frontend
npm install
npm run dev

The app will be running at: http://localhost:3000

---

## Requires a valid OpenAI API key.
