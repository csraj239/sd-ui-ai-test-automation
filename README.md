# Successive Digital UI AI Enabled Test Automation

A comprehensive AI-powered test automation platform built with React, NestJS, and Playwright.

## 📋 Project Overview

This application provides an intelligent test automation platform with three custom AI agents:
- **Planner Agent**: Generates test scenarios from acceptance criteria
- **Generator Agent**: Creates Playwright scripts from test scenarios
- **Healer Agent**: Automatically fixes failing tests

## 🏗️ Architecture

### Three Repositories

#### 1. Frontend (React + TypeScript + Tailwind CSS)
- **Port**: 3000
- **Path**: `/frontend`
- Interactive UI for test automation workflow
- Routes:
  - `/` - Home Page
  - `/dashboard` - Dashboard with statistics
  - `/projects` - Project management
  - `/planner` - Test plan creation with AI
  - `/generator` - Playwright script generation
  - `/scenarios` - Test scenario management
  - `/suites` - Test suite management
  - `/execution` - Test execution management
  - `/reports` - Execution reports and analytics
  - `/healer` - AI-powered test fixing

#### 2. Backend (NestJS + TypeORM + PostgreSQL)
- **Port**: 3001
- **Path**: `/backend`
- RESTful API with Swagger documentation
- Modules:
  - Projects
  - Test Plans
  - Test Scenarios
  - Test Suites
  - Execution Management
  - Reports
  - Authentication

#### 3. Executor (Node.js + Playwright + BullMQ)
- **Path**: `/executor`
- Test execution service
- BullMQ queue processor
- Playwright test runner
- Screenshot and video capture

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7.4+ (or use Docker)

### Quick Start with Docker

```bash
# Set Azure OpenAI credentials
export OPENAI_API_KEY="your-api-key"

# Start all services
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api-docs
# MinIO: http://localhost:9001
```

### Manual Setup (Development)

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run build
npm run migration:run  # Run database migrations
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Executor Setup
```bash
cd executor
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each directory (backend, executor, frontend):

```bash
# Backend .env
DATABASE_URL=postgresql://sa:password@localhost:5432/sd_test_automation_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AZURE_OPENAI_ENDPOINT=https://genaipoc-sd.openai.azure.com/
OPENAI_API_KEY=your-api-key
AZURE_DEPLOYMENT_NAME=gpt-4o

# Frontend .env
VITE_API_URL=http://localhost:3001/api

# Executor .env
API_URL=http://localhost:3001/api
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📊 Database Schema

### Tables
- `projects` - Test projects
- `test_plans` - Test plans with AI-generated scenarios
- `test_scenarios` - Individual test scenarios with Playwright scripts
- `test_suites` - Collections of test scenarios
- `test_executions` - Test execution records
- `execution_reports` - Execution reports and analytics

## 🤖 AI Agents

### Planner Agent
Generates test scenarios based on:
- Navigation flow
- Acceptance criteria
- Custom prompts

### Generator Agent
Creates Playwright scripts from:
- Test scenario descriptions
- Step-by-step test actions
- Application URL

### Healer Agent
Fixes failing tests by:
- Analyzing error messages
- Understanding test intent
- Generating corrected scripts

## 📡 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Test Plans
- `GET /api/test-plans` - List test plans
- `POST /api/test-plans` - Create test plan
- `POST /api/test-plans/:id/generate` - Generate scenarios with AI
- `POST /api/test-plans/:id/link-scenarios` - Link scenarios to plan

### Test Scenarios
- `GET /api/test-scenarios` - List scenarios
- `POST /api/test-scenarios` - Create scenario
- `PATCH /api/test-scenarios/:id` - Update scenario
- `PATCH /api/test-scenarios/:id/script` - Update script

### Execution
- `POST /api/executions/scenario` - Execute single scenario
- `POST /api/executions/suite` - Execute test suite
- `GET /api/executions/:id` - Get execution status

### Reports
- `GET /api/reports` - List reports
- `GET /api/reports/stats/scenarios` - Get scenario statistics
- `GET /api/reports/scenario/:scenarioId` - Get scenario history

## 🧪 Testing Sample

Use https://www.saucedemo.com with:
- Username: `standard_user`
- Password: `secret_sauce`

## 📦 Technology Stack

### Frontend
- React 18.3.1
- TypeScript 4.9.5
- Tailwind CSS 3.4.1
- Axios for HTTP
- Zustand for state management
- React Router for navigation
- Vite for build

### Backend
- NestJS 10.x
- TypeScript 5.3.x
- TypeORM
- PostgreSQL 15
- Redis 7.4.7
- BullMQ for job queues
- Swagger/OpenAPI

### Executor
- Node.js 18+
- Playwright
- BullMQ worker
- Redis client
- Winston for logging

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7.4.7
- MinIO (object storage)

## 📝 Development Guidelines

### Frontend
- Use TypeScript for type safety
- Follow Tailwind CSS utility-first approach
- Use Zustand for global state
- Keep components small and reusable

### Backend
- Follow NestJS module structure
- Use TypeORM for database operations
- Implement proper error handling
- Use Swagger decorators for API docs

### Executor
- Handle job failures gracefully
- Log all execution details
- Capture screenshots and videos
- Update database with execution status

## 🔒 Security

- JWT-based authentication
- Environment variable management
- Database connection pooling
- HTTPS ready (configure in production)
- API rate limiting (implement as needed)

## 📈 Scaling Considerations

- Horizontal scaling with Redis
- BullMQ for distributed job processing
- Database connection pooling
- CDN for static assets
- Load balancing for multiple instances

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL
docker-compose logs postgres

# Verify connection
psql -h localhost -U sa -d sd_test_automation_db
```

### Redis Issues
```bash
# Check Redis
docker-compose logs redis

# Test connection
redis-cli -h localhost
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [Playwright Documentation](https://playwright.dev)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

## 📄 License

This project is part of Successive Digital's AI Test Automation initiative.

## 👥 Support

For issues and questions, please refer to the project documentation or contact the development team.
