@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe > nul 2>&1

echo Waiting for processes to stop...
timeout /t 2 /nobreak > nul

echo Starting backend server...
start "Afghan Exchange Backend" cmd /k "npm start"

echo Backend server started!
echo Check the new window for server output.
pause
