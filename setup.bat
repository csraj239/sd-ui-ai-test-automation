@echo off
REM Setup script for Windows - Successive Digital AI Test Automation

echo 🚀 Setting up SD UI AI Test Automation...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create environment files from examples
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✓ Created backend\.env from template
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo ✓ Created frontend\.env from template
)

if not exist "executor\.env" (
    copy "executor\.env.example" "executor\.env"
    echo ✓ Created executor\.env from template
)

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update the .env files with your Azure OpenAI credentials
echo 2. Run 'docker-compose up' to start all services
echo.
echo 📱 Service URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    API Docs: http://localhost:3001/api-docs
echo    MinIO: http://localhost:9001
echo.
