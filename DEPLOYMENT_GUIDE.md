# Full Stack Deployment Guide - Proxmox LXC with Docker

Complete guide for deploying Arcos app (Frontend + Backend + Database) on Proxmox LXC container.

## Architecture

```
┌─────────────────────────────────┐
│   Proxmox LXC Container         │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Docker Network          │  │
│  │                          │  │
│  │  ┌────────────┐          │  │
│  │  │ PostgreSQL │          │  │
│  │  │  :5432     │          │  │
│  │  └────────────┘          │  │
│  │         ↑                │  │
│  │         │                │  │
│  │  ┌────────────┐          │  │
│  │  │  Backend   │          │  │
│  │  │  :3001     │          │  │
│  │  └────────────┘          │  │
│  │         ↑                │  │
│  │         │                │  │
│  │  ┌────────────┐          │  │
│  │  │  Nginx     │          │  │
│  │  │  :80       │          │  │
│  │  └────────────┘          │  │
│  │                          │  │
│  └──────────────────────────┘  │
│           ↑                    │
└───────────┼────────────────────┘
            │
    Internet Traffic
```

## Quick Deploy

### Option 1: Automated Script (Recommended)

```bash
# On your local machine
./deploy-remote-full.sh root@192.168.2.189
```

### Option 2: Manual Deployment

#### 1. Prepare Environment

```bash
# Create .env.production
cp .env.production .env.production

# Edit and set:
# - DB_PASSWORD (strong password)
# - JWT_SECRET (32+ character random string)
# - CORS_ORIGIN (your server IP/domain)
```

#### 2. Build Locally

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm install
npm run build
cd ..
```

#### 3. Transfer to Server

```bash
# Create deployment package
tar czf cretewerkz-full.tar.gz \
  dist/ \
  backend/dist/ \
  backend/package.json \
  backend/tsconfig.json \
  docker-compose.yml \
  nginx.conf \
  .env.production

# Transfer
scp cretewerkz-full.tar.gz root@192.168.2.189:/opt/

# SSH to server
ssh root@192.168.2.189

# Extract
cd /opt
mkdir -p arcos-app
cd arcos-app
tar xzf ../cretewerkz-full.tar.gz
```

#### 4. Deploy on Server

```bash
cd /opt/arcos-app

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Services

- **Frontend**: http://your-server-ip (port 80)
- **Backend API**: http://your-server-ip:3001 (internal, proxied via Nginx)
- **Database**: localhost:5432 (internal only)

## Default Credentials

- **Email**: admin@arcos.com
- **Password**: admin123

⚠️ **Change these immediately after first login!**

## Management Commands

```bash
# View all services
docker compose ps

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f postgres     # Database only

# Restart services
docker compose restart              # All
docker compose restart backend      # Backend only

# Stop services
docker compose down

# Update application
docker compose down
# (upload new files)
docker compose up -d
```

## Database Backups

```bash
# Backup
docker compose exec postgres pg_dump -U arcos_user arcos_db > backup.sql

# Restore
docker compose exec -T postgres psql -U arcos_user arcos_db < backup.sql
```

## Auto-Start on Boot

```bash
# On server
sudo cp arcos-fullstack.service /etc/systemd/system/
sudo systemctl enable arcos-fullstack.service
sudo systemctl start arcos-fullstack.service
```

## Environment Variables

Edit `.env.production` on server:

```env
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your-32-character-random-secret-key
CORS_ORIGIN=http://192.168.2.189,http://your-domain.com
```

## Troubleshooting

### Services won't start
```bash
docker compose logs
docker compose ps
```

### Database connection errors
```bash
docker compose logs postgres
docker compose exec postgres psql -U arcos_user -d arcos_db -c "SELECT 1;"
```

### Backend errors
```bash
docker compose logs backend
docker compose restart backend
```

### Port conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep -E ':(80|3001|5432)'

# Change ports in docker-compose.yml if needed
```

## Security Checklist

- [ ] Changed DB_PASSWORD
- [ ] Changed JWT_SECRET (32+ characters)
- [ ] Set CORS_ORIGIN to your actual domains
- [ ] Only port 80 exposed externally
- [ ] Changed admin password after first login
- [ ] Set up SSL/TLS (recommended: use Traefik or certbot)
- [ ] Configured firewall rules
- [ ] Set up automated database backups

## Production Notes

1. **Use strong passwords** for database and JWT secret
2. **Set up SSL/TLS** using a reverse proxy (Traefik, Nginx with Let's Encrypt)
3. **Limit CORS_ORIGIN** to your actual domains
4. **Backup database regularly**
5. **Monitor logs** for errors
6. **Keep Docker and images updated**

## Access

- **Web App**: http://your-server-ip
- **API**: http://your-server-ip/api (proxied through Nginx)
- **Admin Login**: admin@arcos.com / admin123

