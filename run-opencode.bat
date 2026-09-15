@echo off
title Qwen35-Agent - opencode style
color 0A
echo opencode tarzi terminal baslatiliyor...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
  echo [!] Ollama kapali, baslatiliyor...
  start /B ollama serve
  timeout /t 3 /nobreak >nul
)
node terminal-opencode.js
pause
