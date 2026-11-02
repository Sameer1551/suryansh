@echo off
setlocal
title DOP Workspace - Launching...
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launcher.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo =====================================================================
    echo  [!] The application encountered an error during launch.
    echo =====================================================================
    echo.
    pause
)
