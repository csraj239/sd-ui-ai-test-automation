#!/bin/bash

# Setup script for Successive Digital AI Test Automation

echo "🚀 Setting up SD UI AI Test Automation..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files from examples
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env from template"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✓ Created frontend/.env from template"
fi

if [ ! -f executor/.env ]; then
    cp executor/.env.example executor/.env
    echo "✓ Created executor/.env from template"
fi

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY environment variable is not set."
    echo "   Please set it before running: export OPENAI_API_KEY='your-key-here'"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env files with your Azure OpenAI credentials"
echo "2. Run 'docker-compose up' to start all services"
echo ""
echo "📱 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Docs: http://localhost:3001/api-docs"
echo "   MinIO: http://localhost:9001"
echo ""
