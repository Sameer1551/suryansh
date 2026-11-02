@echo off
setlocal
title DOP Workspace - Launching...
cd /d "%~dp0"

if exist "%~dp0project-bolt-sb1-mjzmxyfn\project\START_PROJECT.bat" (
    call "%~dp0project-bolt-sb1-mjzmxyfn\project\START_PROJECT.bat"
) else (
    echo [!] Could not locate project-bolt-sb1-mjzmxyfn\project\START_PROJECT.bat
    pause
)
