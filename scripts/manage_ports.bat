@echo off
setlocal enabledelayedexpansion

:: --- AUTO-ELEVATION TO ADMINISTRATOR ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"=""
    echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"

:: --- CONFIGURATION ---
:: Add your port and IP mappings here.
:: Format: set "PORT_X=TARGET_IP"
set "PORT_5001=192.168.1.154"
set "PORT_5002=26.223.34.99"
set "PORT_5003=26.51.168.7"
set "PORT_5004=192.168.1.13"
:: ---------------------

:Menu
cls
echo ===========================================
echo    WINDOWS PORT FORWARDING MANAGER (BAT)
echo ===========================================
echo 1. View current rules
echo 2. Setup Forwarding (from config)
echo 3. Remove Forwarding (from config)
echo 4. Clear ALL v4tov4 rules
echo 5. Exit
echo.
set /p choice="Select an action (1-5): "

if "%choice%"=="1" goto ShowRules
if "%choice%"=="2" goto AddForwarding
if "%choice%"=="3" goto RemoveForwarding
if "%choice%"=="4" goto ResetAll
if "%choice%"=="5" exit
goto Menu

:ShowRules
cls
echo --- Current Port Forwarding Rules ---
netsh interface portproxy show all
pause
goto Menu

:AddForwarding
cls
echo --- Setting up Port Forwarding ---
for /f "tokens=1,2 delims==" %%A in ('set PORT_') do (
    set "fullKey=%%A"
    set "port=!fullKey:PORT_=!"
    set "targetIp=%%B"
    echo Forwarding: localhost:!port! -^> !targetIp!:5000
    netsh interface portproxy add v4tov4 listenport=!port! listenaddress=127.0.0.1 connectport=5000 connectaddress=!targetIp!
)
echo.
echo Setup complete!
pause
goto Menu

:RemoveForwarding
cls
echo --- Removing Port Forwarding Rules ---
for /f "tokens=1,2 delims==" %%A in ('set PORT_') do (
    set "fullKey=%%A"
    set "port=!fullKey:PORT_=!"
    echo Removing: localhost:!port!
    netsh interface portproxy delete v4tov4 listenport=!port! listenaddress=127.0.0.1
)
echo.
echo Removal complete!
pause
goto Menu

:ResetAll
cls
echo --- Clearing all rules ---
netsh interface portproxy reset
echo Done.
pause
goto Menu
