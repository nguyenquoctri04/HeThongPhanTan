@echo off
setlocal enabledelayedexpansion

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
:: Path to the envoy-proxy directory relative to the script
set "ENVOY_DIR=%SCRIPT_DIR%..\envoy-proxy"

:Menu
cls
echo ===========================================
echo    ENVOY PROXY DOCKER MANAGER
echo ===========================================
echo 1. Start Envoy Stack (detached)
echo 2. Stop Envoy Stack (remove containers)
echo 3. View Logs (follow)
echo 4. Check Container Status
echo 5. Restart Envoy Stack
echo 6. Exit
echo.
set /p choice="Select an action (1-6): "

if "%choice%"=="1" goto StartStack
if "%choice%"=="2" goto StopStack
if "%choice%"=="3" goto ViewLogs
if "%choice%"=="4" goto CheckStatus
if "%choice%"=="5" goto RestartStack
if "%choice%"=="6" exit
goto Menu

:StartStack
cls
echo --- Starting Envoy Proxy Stack ---
cd /d "%ENVOY_DIR%"
docker-compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start Docker Compose. Please check if Docker is running.
) else (
    echo.
    echo [SUCCESS] Envoy Proxy stack is starting...
)
pause
goto Menu

:StopStack
cls
echo --- Stopping Envoy Proxy Stack ---
cd /d "%ENVOY_DIR%"
docker-compose down
echo.
echo [INFO] Envoy Proxy stack stopped and containers removed.
pause
goto Menu

:ViewLogs
cls
echo --- Envoy Proxy Stack Logs (Ctrl+C to exit logs) ---
cd /d "%ENVOY_DIR%"
docker-compose logs -f
goto Menu

:CheckStatus
cls
echo --- Container Status ---
cd /d "%ENVOY_DIR%"
docker-compose ps
echo.
pause
goto Menu

:RestartStack
cls
echo --- Restarting Envoy Proxy Stack ---
cd /d "%ENVOY_DIR%"
docker-compose restart
echo.
echo [INFO] Envoy Proxy stack restarted.
pause
goto Menu
