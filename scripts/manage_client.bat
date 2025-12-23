@echo off
setlocal enabledelayedexpansion

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
:: Path to the client/my-app directory relative to the script
set "CLIENT_DIR=%SCRIPT_DIR%..\client\my-app"

:Menu
cls
echo ===========================================
echo    FRONTEND CLIENT MANAGER
echo ===========================================
echo 1. Run Client (Vite Dev Server)
echo 2. Run ngrok (Expose Port 5173)
echo 3. Run BOTH (Client + ngrok)
echo 4. Install Dependencies (npm install)
echo 5. Check Port 5173 Status
echo 6. Exit
echo.
set /p choice="Select an action (1-6): "

if "%choice%"=="1" goto RunClient
if "%choice%"=="2" goto RunNgrok
if "%choice%"=="3" goto RunBoth
if "%choice%"=="4" goto InstallDeps
if "%choice%"=="5" goto CheckPort
if "%choice%"=="6" exit
goto Menu

:RunClient
cls
echo --- Starting Client (Vite) ---
echo [INFO] Client will open in a NEW window.
cd /d "%CLIENT_DIR%"
if not exist "node_modules\" (
    echo [WARNING] node_modules not found. Installing dependencies first...
    call npm install
)
start "Frontend Client (Vite)" cmd /c "npm run dev & pause"
echo.
echo [SUCCESS] Client launch command sent to new window.
pause
goto Menu

:RunNgrok
cls
echo --- Starting ngrok ---
echo [INFO] ngrok will open in a NEW window.
echo [IMPORTANT] Ensure ngrok is installed and in your PATH.
start "ngrok (Port 5173)" cmd /c "ngrok http 5173 & pause"
echo.
echo [SUCCESS] ngrok launch command sent to new window.
pause
goto Menu

:RunBoth
cls
echo --- Starting Client and ngrok ---
cd /d "%CLIENT_DIR%"
if not exist "node_modules\" (
    echo [WARNING] node_modules not found. Installing dependencies first...
    call npm install
)
start "Frontend Client (Vite)" cmd /c "npm run dev & pause"
start "ngrok (Port 5173)" cmd /c "ngrok http 5173 & pause"
echo.
echo [SUCCESS] Both commands sent to separate windows.
pause
goto Menu

:InstallDeps
cls
echo --- Installing Client Dependencies ---
cd /d "%CLIENT_DIR%"
call npm install
echo.
echo [SUCCESS] Dependencies installed.
pause
goto Menu

:CheckPort
cls
echo --- Checking Port 5173 Status ---
netstat -ano | findstr :5173
echo.
echo If you see a line above, the port is in use. The last number is the PID.
pause
goto Menu
