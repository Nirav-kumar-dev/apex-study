@echo off
title Apex Study OS - Desktop Engine
cd /d "%~dp0"

echo ========================================================
echo   Launching Apex Study OS Desktop Application...
echo ========================================================
echo.

:: Start Vite Development Server in Background if not running
powershell -ExecutionPolicy Bypass -Command "
$portOpen = Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $portOpen) {
    Start-Process -FilePath 'npm.cmd' -ArgumentList 'run dev -- --host 127.0.0.1 --port 5173' -WorkingDirectory '%~dp0' -WindowStyle Hidden
    Start-Sleep -Seconds 2
}
"

:: Open in Native App Window mode using Edge or Chrome
set APP_URL=http://127.0.0.1:5173

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --window-size=1400,900
    exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --window-size=1400,900
    exit /b 0
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --window-size=1400,900
    exit /b 0
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --window-size=1400,900
    exit /b 0
)

:: Fallback to default browser
start %APP_URL%
