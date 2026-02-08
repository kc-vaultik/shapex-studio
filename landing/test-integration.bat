@echo off
echo ================================
echo ShapeX Landing Page Integration Test
echo ================================
echo.

echo [1/4] Checking backend connection...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running!
    echo Please start backend first:
    echo   cd C:\Users\kacnf\shapex\backend
    echo   venv\Scripts\activate
    echo   python main.py
    echo.
    pause
    exit /b 1
)
echo [OK] Backend is running

echo.
echo [2/4] Testing API endpoints...

echo Fetching ideas...
curl -s http://localhost:8000/api/ideas?limit=3
if %errorlevel% neq 0 (
    echo [ERROR] Ideas endpoint failed
    pause
    exit /b 1
)
echo [OK] Ideas endpoint working

echo.
echo Fetching stats...
curl -s http://localhost:8000/api/stats
if %errorlevel% neq 0 (
    echo [ERROR] Stats endpoint failed
    pause
    exit /b 1
)
echo [OK] Stats endpoint working

echo.
echo [3/4] Checking environment variables...
if not exist .env (
    echo [WARN] .env file not found. Creating from .env.example...
    copy .env.example .env >nul
    echo [OK] Created .env file
)

echo.
echo [4/4] Testing build...
call npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] Build successful

echo.
echo ================================
echo All tests passed!
echo ================================
echo.
echo To start the landing page:
echo   npm run dev
echo.
echo Landing page will be available at:
echo   http://localhost:3001
echo.
pause
