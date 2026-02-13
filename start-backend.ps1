# HireLens AI Backend Startup Script (Windows PowerShell)

Write-Host "🚀 Starting HireLens AI Backend..." -ForegroundColor Cyan

# Check if virtual environment exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "backend\venv\Scripts\Activate.ps1"

# Check if dependencies are installed
if (-not (Test-Path "backend\venv\Lib\site-packages\fastapi")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    Set-Location backend
    pip install -r requirements.txt
    Set-Location ..
}

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "   Copy .env.example to .env and add your API keys" -ForegroundColor Yellow
}

# Start server
Write-Host "✨ Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "   API docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Set-Location backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
