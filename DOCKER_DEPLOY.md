# Docker Deployment Guide - Full Stack

This guide explains how to deploy the complete Arcos app (Frontend + Backend + Database) on your Proxmox LXC container using Docker.

## Architecture

- **Frontend**: Nginx serving React app (port 80)
- **Backend API**: Node.js/Express server (port 3001)
- **Database**: PostgreSQL (port 5432, internal only)

All services communicate through a Docker network.

## Quick Deploy

### 1. Prepare Environment

```bash
# Copy environment template
cp .env.production .env.production

# Edit .env.production and set:
# - DB_PASSWORD (strong password)
# - JWT_SECRET (random 32+ character string)
# - CORS_ORIGIN (your server IP/domain)
```

### 2. Run Deployment Script

```bash
./deploy-full.sh
```

This script will:
- Build the frontend
- Build the backend
- Start all Docker containers
- Run database migrations
- Seed initial data

### 3. Access the App

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip:3001
- **Admin Login**: admin@arcos.com / admin123

## Manual Deployment

If you prefer manual steps:

```bash
# 1. Build frontend
npm run build

# 2. Build backend
cd backend
npm install
npm run build
cd ..

# 3. Start all services
docker compose up -d

# 4. Check logs
docker compose logs -f
```

## Service Management

```bash
# View all services
docker compose ps

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f postgres     # Database only
docker compose logs -f frontend     # Frontend only

# Stop services
docker compose down

# Restart services
docker compose restart

# Update and redeploy
git pull
./deploy-full.sh
```

## Database Management

### Access Database

```bash
# Connect to PostgreSQL container
docker compose exec postgres psql -U arcos_user -d arcos_db

# Run migrations manually
docker compose exec backend npm run db:migrate

# Run seed manually
docker compose exec backend npm run db:seed
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U arcos_user arcos_db > backup.sql

# Restore backup
docker compose exec -T postgres psql -U arcos_user arcos_db < backup.sql
```

## Environment Variables

Edit `.env.production`:

```env
# Database password (change this!)
DB_PASSWORD=your_secure_password_here

# JWT secret (change this! Use a long random string)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# CORS origins (comma-separated)
CORS_ORIGIN=http://192.168.2.189,http://your-domain.com
```

## Persistent Data

Database data is stored in a Docker volume `postgres_data` which persists across container restarts.

To backup:
```bash
docker run --rm -v arcos_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

To restore:
```bash
docker run --rm -v arcos_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs

# Check if ports are in use
netstat -tulpn | grep -E ':(80|3001|5432)'
```

### Database connection errors
```bash
# Check if postgres is healthy
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U arcos_user -d arcos_db -c "SELECT 1;"
```

### Backend errors
```bash
# Check backend logs
docker compose logs backend

# Restart backend
docker compose restart backend

# Rebuild backend
docker compose build backend
docker compose up -d backend
```

### Frontend not loading
```bash
# Check if dist folder exists
ls -la dist/

# Rebuild frontend
npm run build

# Restart frontend container
docker compose restart frontend
```

## Security Notes

1. **Change default passwords** in `.env.production`
2. **Use strong JWT_SECRET** (32+ characters)
3. **Limit CORS_ORIGIN** to your actual domains
4. **Expose only port 80** to external network (backend and DB are internal)
5. **Use SSL/TLS** in production (add reverse proxy with Let's Encrypt)

## Production Checklist

- [ ] Changed DB_PASSWORD
- [ ] Changed JWT_SECRET
- [ ] Set correct CORS_ORIGIN
- [ ] Set up SSL/TLS (use Traefik or Nginx reverse proxy)
- [ ] Configured firewall (only port 80/443 open)
- [ ] Set up automated backups
- [ ] Configured log rotation
- [ ] Set up monitoring

