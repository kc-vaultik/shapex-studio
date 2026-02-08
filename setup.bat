@echo off
echo ====================================
echo ShapeX Setup Script
echo ====================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/6] Setting up environment config...
if not exist "config\.env" (
    copy "config\.env.example" "config\.env"
    echo Created config\.env - PLEASE EDIT IT WITH YOUR API KEYS!
) else (
    echo config\.env already exists, skipping...
)

echo.
echo [2/6] Creating Python virtual environment...
cd backend
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)

echo.
echo [3/6] Installing Python dependencies...
call venv\Scripts\activate
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [4/6] Initializing database...
python -c "from app.models.database import init_db; init_db()"

cd ..

echo.
echo [5/6] Installing Node.js dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo [6/6] Creating directories...
if not exist "logs" mkdir logs
if not exist "data" mkdir data

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo IMPORTANT: Edit config\.env with your API keys!
echo.
echo To start ShapeX:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate
echo   python main.py
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo Then visit: http://localhost:3001
echo.
echo See QUICKSTART.md for detailed instructions.
echo.
pause
