@echo off
setlocal enabledelayedexpansion

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
:: Path to the server directory relative to the script
set "SERVER_DIR=%SCRIPT_DIR%..\server"

:Menu
cls
echo ===========================================
echo    BACKEND SERVER MANAGER
echo ===========================================
echo 1. Run Server (Development - nodemon)
echo 2. Run Server (Production - node)
echo 3. Install Dependencies (npm install)
echo 4. Check Port 5000 Status
echo 5. Exit
echo.
set /p choice="Select an action (1-5): "

if "%choice%"=="1" goto RunDev
if "%choice%"=="2" goto RunProd
if "%choice%"=="3" goto InstallDeps
if "%choice%"=="4" goto CheckPort
if "%choice%"=="5" exit
goto Menu

:RunDev
cls
echo --- Starting Server in Development Mode ---
echo [INFO] Server will open in a NEW window.
cd /d "%SERVER_DIR%"
if not exist "node_modules\" (
    echo [WARNING] node_modules not found. Installing dependencies first...
    call npm install
)
start "Backend Server (Dev)" cmd /c "npm run dev & pause"
echo.
echo [SUCCESS] Server launch command sent to new window.
pause
goto Menu

:RunProd
cls
echo --- Starting Server in Production Mode ---
echo [INFO] Server will open in a NEW window.
cd /d "%SERVER_DIR%"
if not exist "node_modules\" (
    echo [WARNING] node_modules not found. Installing dependencies first...
    call npm install
)
start "Backend Server (Prod)" cmd /c "npm start & pause"
echo.
echo [SUCCESS] Server launch command sent to new window.
pause
goto Menu

:InstallDeps
cls
echo --- Installing Server Dependencies ---
cd /d "%SERVER_DIR%"
call npm install
echo.
echo [SUCCESS] Dependencies installed.
pause
goto Menu

:CheckPort
cls
echo --- Checking Port 5000 Status ---
netstat -ano | findstr :5000
echo.
echo If you see a line above, the port is in use. The last number is the PID.
pause
goto Menu
