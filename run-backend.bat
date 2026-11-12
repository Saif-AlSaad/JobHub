@echo off
cd /d "%~dp0backend"
title JobHub Backend
echo [JobHub] Starting FastAPI Backend on http://localhost:8000...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)
python -m uvicorn app.main:app --reload --port 8000
pause
