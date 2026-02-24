# Project Overview

## Application Architecture

```
                        ┌─────────────────────────────┐
                        │   Web Browser (Port 3000)   │
                        │    React Frontend App        │
                        └─────────────┬───────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                  HTTP/S            WebSocket        HTTP/S
                     │                │                │
        ┌────────────▼───────────┐    │    ┌──────────▼──────────┐
        │  NestJS Backend API    │    │    │  Dashboard/Reports  │
        │   (Port 3001)          │    │    │   Real-time Updates │
        │                        │    │    │                     │
        ├────────────────────────┤    │    └─────────────────────┘
        │ • Project Management   │    │
        │ • Test Plans (AI)      │    │
        │ • Test Scenarios       │    │
        │ • Test Suites          │    │
        │ • Executions (Queue)   │    │
        │ • Reports              │    │
        │ • Authentication       │    │
        └────────────┬───────────┘    │
                     │                │
        ┌────────────▼──────────────┐ │
        │    PostgreSQL Database    │ │
        │      (Port 5432)          │ │
        │                           │ │
        │ • Projects               │ │
        │ • Test Plans             │ │
        │ • Test Scenarios         │ │
        │ • Test Suites            │ │
        │ • Executions             │ │
        │ • Reports                │ │
        └───────────────────────────┘ │
                     ▲                │
                     │ Query          │
        ┌────────────┴──────────────┐ │
        │   Redis Queue System      │ │
        │    (Port 6379)            │ │
        │                           │ │
        │ • BullMQ Job Queue        │ │
        │ • Test Execution Jobs     │ │
        │ • Session Cache           │ │
        └───────────────────────────┘ │
                     ▲                │
                     │ Job Push       │
                     │                │
        ┌────────────┴──────────────┐ │
        │   Executor Service        │ │
        │  (Node.js Worker)         │ │
        │                           │ │
        │ • BullMQ Worker          │ │
        │ • Playwright Runner      │ │
        │ • Screenshot/Video       │ │
        │ • Report Generation      │ │
        └───────────────────────────┘ │
                     │                │
        ┌────────────▼──────────────┐ │
        │    MinIO Storage          │ │
        │   (Port 9000/9001)        │ │
        │                           │ │
        │ • Test Artifacts         │ │
        │ • Screenshots            │ │
        │ • Video Recordings       │ │
        └───────────────────────────┘ │
                                      │
        ┌─────────────────────────────────┐
        │  Azure OpenAI (Cloud APIs)      │
        │  (GPT-4o)                       │
        │                                 │
        │  • Planner Agent                │
        │  • Generator Agent              │
        │  • Healer Agent                 │
        └─────────────────────────────────┘
```

## Data Flow

### Test Plan Generation Flow
```
User Input (Navigation Flow + Criteria)
    ↓
Test Planner Page
    ↓
Backend API: POST /test-plans/generate
    ↓
Planner AI Agent (Azure OpenAI)
    ↓
Generate Test Scenarios
    ↓
Display Scenarios for Selection
    ↓
User Selects Scenarios
    ↓
Link Scenarios to Test Plan
    ↓
Test Plan Created in Database
```

### Script Generation Flow
```
User Selects Scenario
    ↓
Generator Page
    ↓
Backend API: POST /test-scenarios/generate-script
    ↓
Generator AI Agent (Azure OpenAI)
    ↓
Generate Playwright Script
    ↓
Display Script for Review/Edit
    ↓
User Clicks Execute or Save
    ↓
Save to Database / Queue Execution
    ↓
View Results
```

### Test Execution Flow
```
Execute Scenario/Suite
    ↓
Backend: POST /executions/scenario
    ↓
Create Execution Record
    ↓
Queue Job in Redis (BullMQ)
    ↓
Executor Worker Picks Up Job
    ↓
Launch Browser (Playwright)
    ↓
Run Test Script
    ↓
Capture Screenshots/Video
    ↓
Update Execution Status
    ↓
Generate Report
    ↓
Store Artifacts in MinIO
    ↓
Display Results in Reports
```

## Page Navigation Map

```
                            ┌─────────────┐
                            │  Home Page  │
                            │ (Landing)   │
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │  Dashboard  │
                            │ (Stats)     │
                            └──────┬──────┘
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┐ ┌───▼────────┐ ┌───▼─────────┐
            │  Projects      │ │ Planner    │ │ Generator   │
            │ (CRUD)         │ │ (AI Plans) │ │ (AI Scripts)│
            └────────────────┘ └─────┬──────┘ └───┬─────────┘
                                     │            │
                            ┌────────▼────────┐   │
                            │ Test Scenarios  │   │
                            │ (Scripts, Run)  │◄──┘
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │ Test Suites     │
                            │ (Collections)   │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │ Execution       │
                            │ (Run & History) │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │ Reports         │
                            │ (Analytics)     │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │ Healer          │
                            │ (AI Fix Failing)│
                            └─────────────────┘
```

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  React 18.3 | TypeScript | Tailwind CSS | Vite             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
│  NestJS 10 | TypeScript | Swagger/OpenAPI                  │
│  REST Endpoints | JWT Auth | Input Validation              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────┐         ┌────────┐         ┌────────┐
    │DATABASE│         │ CACHE  │         │ QUEUE  │
    │        │         │        │         │        │
    │Postgres│         │ Redis  │         │BullMQ  │
    │   15   │         │ 7.4.7  │         │ 5.0.3  │
    └────────┘         └────────┘         └────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │  EXECUTOR    │
                                        │              │
                                        │Playwright    │
                                        │+Winston      │
                                        │+Node.js      │
                                        └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │   STORAGE    │
                                        │              │
                                        │ MinIO        │
                                        │ (Artifacts)  │
                                        └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AI LAYER                                 │
│  Azure OpenAI | GPT-4o | Planner | Generator | Healer      │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Docker Container Network
├── Frontend Container (Port 3000)
├── Backend Container (Port 3001)
├── PostgreSQL Container (Port 5432)
├── Redis Container (Port 6379)
├── MinIO Container (Ports 9000/9001)
└── Executor Container (Background Worker)

All connected via Docker Network "sd-network"
```

## File Statistics

- **Total Files**: 100+
- **TypeScript Files**: 75+
- **Configuration Files**: 15+
- **Database Entities**: 6
- **API Endpoints**: 50+
- **Frontend Components**: 15+
- **Backend Modules**: 7
- **Lines of Code**: 5000+

## Development Highlights

✨ **Modern Stack**: Latest versions of React, NestJS, and TypeScript  
✨ **AI Integration**: 3 custom AI agents for intelligent automation  
✨ **Scalable**: BullMQ for distributed job processing  
✨ **Type-Safe**: Full TypeScript implementation  
✨ **Well-Documented**: Comprehensive README and setup guides  
✨ **Production-Ready**: Proper error handling and logging  
✨ **Docker-Ready**: One-command deployment  

## Quick Facts

- 🚀 **Total Implementation Time**: Full stack application
- 📦 **Database Tables**: 6 (normalized and indexed)
- 🔌 **API Endpoints**: 50+ (CRUD operations)
- 🖥️ **Frontend Pages**: 9 (responsive design)
- 🤖 **AI Agents**: 3 (Planner, Generator, Healer)
- 📝 **Documentation**: Complete with examples
- 🐳 **Docker Support**: Full containerization
- 🔒 **Security**: JWT, validation, CORS configured

---

The application is production-ready and fully implements the requirements from ProjectRequest.md! 🎉
