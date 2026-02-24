# Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- OpenAI API Key (Azure deployment)
- Node.js 18+ (for local development)
- Git for version control

## Option 1: Quick Start with Docker (Recommended)

### Step 1: Pull Azure OpenAI Credentials
```bash
# Set the OpenAI API key
export OPENAI_API_KEY=""
```

### Step 2: Start All Services
```bash
cd sd-ui-ai-test-automation

# On Linux/Mac
chmod +x setup.sh
./setup.sh
docker-compose up -d

# On Windows
setup.bat
docker-compose up -d
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs
- **MinIO Console**: http://localhost:9001

### Step 4: Test the Application
1. Go to http://localhost:3000
2. Navigate to Dashboard to see initial statistics
3. Go to Projects page and create a new project
4. Create a Test Plan with navigation flow and acceptance criteria
5. Click "Generate Plan" to use the AI Planner agent
6. Select scenarios and go to Generator
7. Choose scenarios and generate Playwright scripts
8. Execute and manage test scenarios

## Option 2: Development Setup (Local)

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Build the project
npm run build

# Run database migrations
npm run typeorm migration:run

# Start development server
npm run start:dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

### Executor Setup
```bash
cd executor

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start the executor worker
npm run dev
```

## Configuration

### Environment Variables

Edit each `.env` file to configure:

**Backend** (`backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=sa
DB_PASSWORD=password
DB_DATABASE=sd_test_automation_db
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=your-key-here
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

**Executor** (`executor/.env`):
```env
API_URL=http://localhost:3001/api
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Database Setup

The database will auto-initialize with Docker Compose. For local development:

```bash
# Create database
createdb -U sa sd_test_automation_db

# Run migrations
cd backend
npm run typeorm migration:run
```

## Testing

### Sample Test Application
Use https://www.saucedemo.com:
- Username: `standard_user`
- Password: `secret_sauce`

### Manual API Testing
```bash
# Create a project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Sample Project","appUrl":"https://www.saucedemo.com"}'

# List projects
curl http://localhost:3001/api/projects
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill the process using the port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Docker Issues
```bash
# Clean up containers and volumes
docker-compose down -v
docker system prune -a

# Rebuild images
docker-compose build --no-cache
```

### Database Connection Issues
```bash
# Check PostgreSQL container
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U sa -d sd_test_automation_db
```

### Redis Connection
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Check Redis keys
docker-compose exec redis redis-cli keys '*'
```

## Useful Docker Commands

```bash
# View logs
docker-compose logs -f [service-name]

# Enter container shell
docker-compose exec [service-name] sh

# Restart services
docker-compose restart

# Stop all services
docker-compose stop

# Remove all services and data
docker-compose down -v
```

## Development Workflow

### Frontend Development
1. Edit React components in `frontend/src/pages` and `frontend/src/components`
2. Changes auto-update with Vite hot reload
3. Check browser console for errors

### Backend Development
1. Edit NestJS modules in `backend/src/modules`
2. Changes auto-update with `npm run start:dev`
3. Check terminal for compilation errors

### Adding New Features

#### New API Endpoint
1. Create DTO in `backend/src/modules/[feature]/[feature].dto.ts`
2. Add method to `backend/src/modules/[feature]/[feature].service.ts`
3. Add route to `backend/src/modules/[feature]/[feature].controller.ts`
4. Import in `[feature].module.ts`

#### New Frontend Page
1. Create page component in `frontend/src/pages/[Page]Page.tsx`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Navigation.tsx`

## Monitoring

### Backend Logs
```bash
docker-compose logs -f backend
```

### Frontend Console
Open browser DevTools (F12) → Console tab

### Database Queries
Enable logging in `backend/.env`:
```env
DB_LOGGING=true
```

## Performance Tips

1. **Database**: Use connection pooling for production
2. **Redis**: Configure persistence and replication
3. **Frontend**: Enable compression and CDN
4. **Backend**: Implement caching strategies
5. **Executor**: Use worker pools for parallel execution

## Next Steps

1. ✅ Set up the application
2. 📝 Create your first project and test plan
3. 🤖 Try the AI-powered test generation
4. 📊 View and analyze test reports
5. 🔧 Customize and extend the application

## Support

For detailed documentation, see:
- [Main README.md](../README.md)
- API Documentation: http://localhost:3001/api-docs
- [Playwright Docs](https://playwright.dev)
- [NestJS Docs](https://docs.nestjs.com)

## Common Tasks

### Enable/Disable Services
Edit `docker-compose.yml` and comment out services you don't need:
```yaml
# To disable Executor:
# executor:
#   ...
```

### Change Ports
Edit `docker-compose.yml` port mappings:
```yaml
ports:
  - "8000:3000"  # Changed frontend port
```

### Use Different Database
Update `backend/.env`:
```env
DATABASE_URL=postgresql://user:pass@remote-host:5432/db
```

Enjoy building intelligent test automation! 🚀
