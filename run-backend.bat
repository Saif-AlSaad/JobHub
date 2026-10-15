@echo off
title JobHub Backend
echo [JobHub] Starting FastAPI Backend on http://localhost:8000...
cd backend
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --port 8000
pause
