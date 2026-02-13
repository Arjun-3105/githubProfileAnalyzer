# HireLens AI Frontend Startup Script (Windows PowerShell)

Write-Host "🚀 Starting HireLens AI Frontend..." -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Start Next.js dev server
Write-Host "✨ Starting Next.js on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Set-Location frontend
npm run dev
