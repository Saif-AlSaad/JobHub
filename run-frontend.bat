@echo off
cd /d "%~dp0frontend"
title JobHub Frontend
echo [JobHub] Starting React Vite Frontend on http://localhost:5173...
call npm run dev
pause
