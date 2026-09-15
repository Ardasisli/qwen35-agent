@echo off
title Qwen35-Agent Terminal Plus (Rich TUI)
color 0B
echo ========================================
echo   Qwen35-Agent Terminal Plus
echo   Web UI ile esdeger Rich TUI
echo ========================================
echo.
echo Ollama kontrol ediliyor...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
  echo [!] Ollama calismiyor, baslatiliyor...
  start /B ollama serve
  timeout /t 3 /nobreak >nul
)
echo [OK] Ollama hazir
echo.
echo Terminal Plus aciliyor...
echo   /help ile komutlari gor, /ui ile Web UI ac
echo.
node terminal-plus.js
pause
