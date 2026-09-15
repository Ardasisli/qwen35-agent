@echo off
title Qwen35-Agent Web UI
color 0A
echo ========================================
echo   Qwen35-Agent Web Arayuzu Baslatiliyor
echo ========================================
echo.
REM Ollama kontrol
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
  echo [!] Ollama kapali, baslatiliyor...
  start /B ollama serve
  timeout /t 3 /nobreak >nul
)
echo [OK] Ollama hazir

echo [OK] Web server baslatiliyor...
cd /d "%~dp0web-ui"
start http://127.0.0.1:5173
node server.js
pause
