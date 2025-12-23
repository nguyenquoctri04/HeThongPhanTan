@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURATION ---
set "SCRIPT_DIR=%~dp0"
set "ENVOY_DIR=%SCRIPT_DIR%..\envoy-proxy"
set "CLIENT_DIR=%SCRIPT_DIR%..\client\my-app"
set "NGROK_CONFIG=%SCRIPT_DIR%ngrok_temp.yml"

:: [OPTIONAL] Set your ngrok authtoken here if not already configured on your system
:: Get it from: https://dashboard.ngrok.com/get-started/your-authtoken
set "NGROK_AUTHTOKEN=2Oe9vYQZWDPLIa6613fbT8qLHws_Z7mTpXDLJLo6Gu9MQgHL"

echo ===========================================
echo    FULL STACK NGROK AUTOMATION (FIXED)
echo ===========================================

:: 1. Verify Authtoken (Required for multi-tunnel)
echo [1/7] Verifying ngrok authtoken...

:: If token is empty in script, check if it exists in local appdata (default ngrok config location)
if "%NGROK_AUTHTOKEN%"=="" (
    if not exist "%LOCALAPPDATA%\ngrok\ngrok.yml" (
        echo [ERROR] No ngrok authtoken found!
        echo.
        echo Please either:
        echo 1. Set the NGROK_AUTHTOKEN variable at the top of this script.
        echo 2. Run 'ngrok config add-authtoken YOUR_TOKEN' in a new terminal.
        echo.
        pause
        exit /b
    )
)

:: 2. Create temporary ngrok config (To run multiple tunnels on 1 session)
echo [2/7] Creating temporary ngrok config...
(
echo version: "2"
if not "%NGROK_AUTHTOKEN%"=="" echo authtoken: %NGROK_AUTHTOKEN%
echo tunnels:
echo   envoy:
echo     proto: http
echo     addr: 10000
echo   frontend:
echo     proto: http
echo     addr: 5173
) > "%NGROK_CONFIG%"

:: 3. Start Envoy Stack
echo [3/7] Starting Envoy Proxy Stack...
cd /d "%ENVOY_DIR%"
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Docker.
    pause
    exit /b
)

:: 4. Start ngrok tunnels (Both in ONE session)
echo [4/7] Starting ngrok tunnels (Envoy + Frontend)...
:: Using cmd /k so the window stays open if there is an error
start "ngrok-multi-tunnel" cmd /k "ngrok start --all --config ^"%NGROK_CONFIG%^""

:: 5. Wait for ngrok to initialize and fetch URLs
echo [5/7] Waiting for ngrok URLs (approx 8s)...
timeout /t 8 >nul

:: Fetch URLs using PowerShell (all tunnels will be on port 4040 since it's one process)
for /f "delims=" %%i in ('powershell -Command "(Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels | Where-Object { $_.config.addr -like '*10000*' } | Select-Object -ExpandProperty public_url" 2^>nul') do set "ENVOY_URL=%%i"
for /f "delims=" %%i in ('powershell -Command "(Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels | Where-Object { $_.config.addr -like '*5173*' } | Select-Object -ExpandProperty public_url" 2^>nul') do set "FE_URL=%%i"

if "%ENVOY_URL%"=="" (
    echo [ERROR] Could not fetch ngrok URL for Envoy. 
    echo Please check the ngrok window for error messages.
    pause
    exit /b
)

set "VITE_API_URL=%ENVOY_URL%/api"

:: 6. Start Client with VITE_API_BASE_URL entry
echo [6/7] Starting Frontend Client (Vite)...
cd /d "%CLIENT_DIR%"
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
)

:: Set variable and start Vite
:: Removed space before && to avoid %20 in URLs
start "Frontend (Vite)" cmd /c "set VITE_API_BASE_URL=%VITE_API_URL%&& npm run dev & pause"

:: 7. Final Summary
cls
echo ===========================================================
echo    FULL STACK NGROK AUTOMATION - SUMMARY
echo ===========================================================
echo.
echo [BACKEND - Envoy Proxy]
echo Local Address:  http://localhost:10000
echo Public URL:     !ENVOY_URL!
echo.
echo [FRONTEND - Vite Client]
echo Local Address:  http://localhost:5173
if "!FE_URL!"=="" (
    echo Public URL:     [ERROR] Could not fetch FE URL
) else (
    echo Public URL:     !FE_URL!
)
echo.
echo [CONFIGURATION]
echo VITE_API_BASE_URL was set to: !VITE_API_URL!
echo.
echo ===========================================================
echo [TIP] All tunnels are now running in ONE ngrok session.
echo [TIP] If there are errors, check the open ngrok window.
echo.
pause
