@echo off
title Farm Fusion Control Center
echo ==========================================
echo    🌾 Starting Farm Fusion Stack...
echo ==========================================

:: Change directory to workspace root
cd /d "%~dp0"

:: Start Backend API
echo [1/3] Launching Express Backend Server...
start "Farm Fusion Backend" cmd /k "cd backend && npm run dev"

:: Start AI Microservice
echo [2/3] Launching FastAPI AI Microservice...
start "Farm Fusion AI Service" cmd /k ".\.venv\Scripts\python ai-service/main.py"

:: Start React Frontend
echo [3/3] Launching React Frontend Dev Server...
start "Farm Fusion Frontend" cmd /k "cd frontend && npm run dev"

echo ------------------------------------------
echo ✅ All services triggered successfully!
echo ------------------------------------------
echo 🔗 Backend API URL:    http://localhost:5000
echo 🔗 AI Microservice:    http://localhost:8000
echo 🔗 React Frontend:     http://localhost:5173
echo.
echo Press any key to exit this control window...
pause > nul
