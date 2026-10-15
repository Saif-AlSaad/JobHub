@echo off
title JobHub Launcher
echo =======================================================
echo          Launching JobHub Application Suite
echo =======================================================
echo.
echo 1. Starting Backend in new window...
start "JobHub Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

echo 2. Starting Frontend in new window...
start "JobHub Frontend" cmd /k "cd frontend && call npm run dev"

echo.
echo All services launched!
echo - Frontend UI:     http://localhost:5173
echo - Backend API:     http://localhost:8000
echo - Swagger Docs:    http://localhost:8000/docs
echo.
echo Demo Accounts:
echo - Seeker:    sarah.rahman@jobhub.io  / password123
echo - Recruiter: recruiter@technova.io   / password123
echo - Admin:     admin@jobhub.io         / password123
echo.
timeout /t 5
