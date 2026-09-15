@echo off
title Qwen35-Agent - Web gibi TUI (gelismis)
color 0A
echo Qwen35-Agent gelismis TUI baslatiliyor...
echo  - kutucuk yok, web gibi tasarim alani
echo  - ust header + ortada mesajlar + altta input
echo.
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
  echo [!] Ollama kapali, baslatiliyor...
  start /B ollama serve
  timeout /t 3 /nobreak >nul
)
node tui-web.js
pause
