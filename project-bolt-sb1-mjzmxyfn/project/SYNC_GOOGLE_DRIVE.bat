@echo off
title Sync DOP Master Database to Google Drive (Suryansh.dp)
color 0b

echo ================================================================
echo       Suryansh.dp - Master Database to Google Drive Sync
echo                  Account: suryanshh.dp@gmail.com
echo ================================================================
echo.

cd /d "%~dp0"

python scripts\sync_to_google_sheets.py

echo.
echo ================================================================
echo Process finished. Press any key to close this window.
echo ================================================================
pause >nul
