# EWS Backend v9.0 - NestJS + Prisma

Saudi Food Security Early Warning System - Production Backend

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL + Redis
docker-compose up -d postgres redis

# 3. Run migrations
npx prisma migrate dev

# 4. Seed data
npm run db:seed

# 5. Start dev server
npm run start:dev

# API: http://localhost:3000/api
# Docs: http://localhost:3000/docs
```

## Architecture

- **NestJS** - Enterprise TypeScript framework
- **Prisma** - Type-safe ORM with auto-generated types
- **PostgreSQL** - Primary relational database
- **Redis** - Caching and session storage
- **JWT** - Stateless authentication
- **WebSocket** - Real-time alert streaming
- **Swagger** - Auto-generated API documentation

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Auth | `/api/auth` | JWT login/register/refresh |
| Dashboard | `/api/dashboard` | KPIs, latest prices, recent alerts |
| Alerts | `/api/alerts` | CRUD, filtering, acknowledgment |
| Commodities | `/api/commodities` | Prices, stocks, suppliers |
| Scenarios | `/api/scenarios` | Risk domains, initiatives |
| Data Sources | `/api/data-sources` | Health monitoring |
| AI Chat | `/api/ai-chat` | Intelligence assistant |
| Reports | `/api/reports` | Report generation |
| WebSocket | `/alerts` | Real-time streaming |
