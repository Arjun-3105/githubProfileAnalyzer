# HireLens AI - Setup & Testing Guide

## Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** and npm installed
- **GitHub Personal Access Token** (optional but recommended)
- **OpenRouter API Key** (already in your `.env`)

---

## Step 1: Backend Setup

### 1.1 Install Python Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Configure Environment Variables

Your `.env` file already exists. Make sure it has:

```env
GITHUB_TOKEN=your_github_token_here  # Optional but recommended
OPENROUTER_API_KEY=sk-or-v1-...      # Already set
```

**To get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `public_repo` scope
4. Copy token and paste in `.env`

### 1.3 Run Backend Server

```bash
# Make sure you're in backend/ directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test the backend:**
- Open http://localhost:8000/docs (FastAPI auto-generated docs)
- You should see all endpoints listed

---

## Step 2: Frontend Setup

### 2.1 Install Node Dependencies

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies
npm install
```

### 2.2 Run Frontend Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  - Ready in X seconds
```

**Open in browser:** http://localhost:3000

---

## Step 3: Testing the Application

### 3.1 Test via Web UI

1. **Landing Page** (http://localhost:3000)
   - Should show the marketing page with CTAs

2. **Analyze Page** (http://localhost:3000/analyze)
   - Enter a GitHub URL: `https://github.com/octocat` (or any public profile)
   - Click "Run analysis"
   - Wait 10-30 seconds (LLM calls take time)
   - Should show:
     - Portfolio score breakdown
     - Red flags (if any)
     - Recruiter verdict
     - Developer archetype

3. **Job Match Page** (http://localhost:3000/job-match)
   - Enter GitHub URL
   - Paste a job description
   - Click "Run job match"
   - Should show match score and recommendations

4. **Dashboard Page** (http://localhost:3000/dashboard)
   - Shows sample charts (currently static data)

### 3.2 Test via API Directly

**Using curl (or Postman):**

```bash
# Test analyze endpoint
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/octocat"}'

# Test job match endpoint
curl -X POST "http://localhost:8000/api/job-match" \
  -H "Content-Type: application/json" \
  -d '{
    "github_url": "https://github.com/octocat",
    "job_description": "Looking for a full-stack developer with React and Python experience."
  }'

# Test README rewrite
curl -X POST "http://localhost:8000/api/rewrite-readme" \
  -H "Content-Type: application/json" \
  -d '{"content": "# My Project\nA simple project."}'

# Test roadmap generator
curl -X POST "http://localhost:8000/api/roadmap" \
  -H "Content-Type: application/json" \
  -d '{"weaknesses_summary": "No tests, limited documentation, few projects"}'
```

**Using FastAPI Docs (easiest):**
- Go to http://localhost:8000/docs
- Click on any endpoint
- Click "Try it out"
- Fill in the request body
- Click "Execute"

---

## Step 4: Troubleshooting

### Backend Issues

**Import errors:**
```bash
# Make sure you're in backend/ directory
# Make sure virtual environment is activated
pip install -r requirements.txt
```

**Port already in use:**
```bash
# Change port
uvicorn app.main:app --reload --port 8001
# Then update frontend API calls to use port 8001
```

**GitHub rate limit errors:**
- Add `GITHUB_TOKEN` to `.env` file
- Restart backend server

**OpenRouter API errors:**
- Check `.env` has valid `OPENROUTER_API_KEY`
- Verify key at https://openrouter.ai/keys

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 in use:**
```bash
# Change port
npm run dev -- -p 3001
```

**API connection errors:**
- Make sure backend is running on port 8000
- Check browser console for CORS errors
- Verify `http://localhost:8000/api/analyze` is accessible

---

## Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:8000/docs
- [ ] Analyze endpoint returns data for a test profile
- [ ] Frontend can call backend API
- [ ] No CORS errors in browser console

---

## Next Steps

Once everything is running:
1. Try analyzing your own GitHub profile
2. Test job matching with a real job description
3. Explore the dashboard visualizations
4. Check the recruiter insights for accuracy

Happy testing! 🚀
