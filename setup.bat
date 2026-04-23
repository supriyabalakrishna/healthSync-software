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

REM Root Setup
echo.
echo 📦 Installing root dependencies...
cd ..
call npm install

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Open Terminal and run: npm run dev
echo 2. Optional - in another terminal: net start MongoDB (if not already running)
echo 3. Open http://localhost:5173 in your browser
echo.
echo 💡 For sign up test, use:
echo    Email: test@example.com
echo    Password: password123
echo.
pause
