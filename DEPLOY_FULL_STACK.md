# Full Stack Deployment Guide

Complete guide for deploying the Arcos app (Frontend + Backend + Database) on Proxmox LXC using Docker.

## Quick Start

### 1. Prepare Environment File

```bash
# Create .env.production
cp .env.production .env.production

# Edit and set secure values:
# - DB_PASSWORD (strong password)
# - JWT_SECRET (random 32+ character string)
# - CORS_ORIGIN (your server IP/domain)
```

### 2. Deploy Locally (for testing)

```bash
./deploy-full.sh
```

### 3. Deploy to Remote Server

```bash
./deploy-remote-full.sh root@192.168.2.189
```

## What Gets Deployed

1. **PostgreSQL Database** - Data storage
2. **Backend API** - Node.js/Express server
3. **Frontend** - React app served by Nginx

All services run in Docker containers and communicate via internal network.

## Architecture

```
Internet
   ↓
[Port 80] Nginx (Frontend)
   ↓
[Port 3001] Backend API (Internal)
   ↓
[Port 5432] PostgreSQL (Internal)
```

## Services

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip:3001 (internal)
- **Database**: localhost:5432 (internal only)

## Default Credentials

- **Email**: admin@arcos.com
- **Password**: admin123

⚠️ **Change these in production!**

## Database Persistence

Database data is stored in Docker volume `postgres_data` which persists across restarts.

## Backup & Restore

### Backup Database

```bash
# On server
docker compose exec postgres pg_dump -U arcos_user arcos_db > backup.sql
```

### Restore Database

```bash
# On server
docker compose exec -T postgres psql -U arcos_user arcos_db < backup.sql
```

## Maintenance

### View Logs

```bash
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f postgres     # Database only
```

### Restart Services

```bash
docker compose restart              # All services
docker compose restart backend      # Backend only
```

### Update Application

```bash
# On your local machine
git pull
./deploy-remote-full.sh root@your-server
```

## Troubleshooting

See `DOCKER_DEPLOY.md` for detailed troubleshooting guide.

## Security Checklist

- [ ] Changed DB_PASSWORD in .env.production
- [ ] Changed JWT_SECRET (32+ characters)
- [ ] Set CORS_ORIGIN to your actual domain
- [ ] Only port 80 exposed to external network
- [ ] Set up SSL/TLS (recommended: use Traefik or certbot)
- [ ] Changed admin password after first login
- [ ] Set up automated database backups

