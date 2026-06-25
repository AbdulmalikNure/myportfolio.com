@echo off
echo ========================================
echo  Portfolio Application Launcher
echo ========================================
echo.
echo Starting all servers...
echo.
echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 5 /nobreak > nul

echo [2/3] Starting Frontend Portfolio...
start "Frontend Portfolio" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Admin Panel...
start "Admin Panel" cmd /k "cd /d "%~dp0admin" && npm run dev"

echo.
echo ========================================
echo  All servers are starting!
echo ========================================
echo.
echo Wait for all terminals to finish loading, then:
echo.
echo   Portfolio:  http://localhost:5173
echo   Admin:      http://localhost:5174
echo   Backend:    http://localhost:5000
echo.
echo Login credentials:
echo   Email:    myportfolio@gmail.com
echo   Password: @Ab7340diand
echo.
echo Press any key to exit this window...
pause > nul
