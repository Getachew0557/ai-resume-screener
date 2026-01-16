# Innovation & Service HR System - Docker Setup

## Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Running the Application

1. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and set your passwords and secrets
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Auth Service: http://localhost:3000
   - Recruitment Service: http://localhost:3002

### Development Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Rebuild specific service
docker-compose build recruitment-service
docker-compose up -d recruitment-service
```

### Running Tests

**Backend Tests (Recruitment Service)**
```bash
cd services/recruitment-service
npm install
npm test
```

**Frontend Tests**
```bash
cd frontend
npm install
npm test
```

### Service Health Checks

All services include health checks:
- MySQL: `docker-compose ps` shows health status
- Services: Built-in health check endpoints

### Troubleshooting

**Services won't start:**
```bash
# Check logs
docker-compose logs mysql
docker-compose logs recruitment-service

# Restart specific service
docker-compose restart recruitment-service
```

**Database connection issues:**
```bash
# Ensure MySQL is healthy
docker-compose ps

# Check MySQL logs
docker-compose logs mysql
```

**Port conflicts:**
- Change ports in `docker-compose.yml` if 80, 3000, 3002, or 3306 are already in use

### Production Deployment

For production:
1. Change all passwords and secrets in `.env`
2. Use proper SSL/TLS certificates
3. Configure proper backup strategy for MySQL volume
4. Consider using Docker Swarm or Kubernetes for orchestration
5. Set up monitoring and logging

## Architecture

```
┌─────────────┐
│   Frontend  │ :80
│   (Nginx)   │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│Auth Service │ │Recruitment│ │   MySQL    │
│    :3000    │ │  :3002    │ │   :3306    │
└─────────────┘ └───────────┘ └────────────┘
```

## Testing Coverage

- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library
- Target: 80%+ code coverage
