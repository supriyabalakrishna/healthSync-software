@echo off
REM HealthSync - Complete Setup Script for Windows
REM Run this batch file to set up everything automatically

echo.
echo 🚀 HealthSync Setup Starting...
echo.

REM Backend Setup
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Check if bcryptjs is installed
npm list bcryptjs >nul 2>&1
if errorlevel 1 (
  echo 📦 Installing bcryptjs...
  call npm install bcryptjs@2.4.3
)

REM Frontend Setup
echo.
echo 📦 Installing frontend dependencies...
cd ../frontend
call npm install

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Open Terminal 1 (PowerShell) and run: cd backend; npm start
echo 2. Open Terminal 2 (PowerShell) and run: cd frontend; npm run dev
echo 3. Optional - Terminal 3: net start MongoDB (if not already running)
echo 4. Open http://localhost:5173 in your browser
echo.
echo 💡 For sign up test, use:
echo    Email: test@example.com
echo    Password: password123
echo.
pause
