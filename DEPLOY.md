# Deployment Guide for Proxmox

This guide covers deploying the Cretewerkz app on Proxmox using Docker.

## Prerequisites

1. Proxmox VE installed and running
2. A VM or LXC container with Docker installed
3. Git installed (if cloning from repository)

## Option 1: Deploy with Docker (Recommended)

### Step 1: Create a VM or LXC Container on Proxmox

1. **For VM (Ubuntu/Debian)**:
   - Create a new VM in Proxmox
   - Install Ubuntu 22.04 LTS or Debian 12
   - Allocate at least 2GB RAM, 2 CPU cores, 20GB disk
   - Install Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`
   - Install Docker Compose: `apt-get install docker-compose-plugin`

2. **For LXC Container (Ubuntu)**:
   - Create an LXC container with Ubuntu 22.04
   - Enable nesting and keyctl in container options
   - Install Docker inside the container

### Step 2: Transfer Files to Proxmox

**Option A: Using Git (if you have a repository)**
```bash
ssh root@your-proxmox-ip
git clone <your-repo-url> /opt/cretewerkz-app
cd /opt/cretewerkz-app
```

**Option B: Using SCP**
```bash
# From your local machine
scp -r /Users/andrewsetiawan/cretewerkz-app root@your-proxmox-ip:/opt/cretewerkz-app
ssh root@your-proxmox-ip
cd /opt/cretewerkz-app
```

**Option C: Manual Upload**
- Use Proxmox web interface file manager
- Or use WinSCP/FileZilla

### Step 3: Build and Run with Docker Compose

```bash
cd /opt/cretewerkz-app

# Build and start the container
docker compose up -d --build

# Check logs
docker compose logs -f

# Check if it's running
docker ps
```

### Step 4: Access the Application

- Open your browser and navigate to: `http://your-proxmox-ip`
- Or if using a domain: `http://your-domain.com`

### Step 5: Configure Firewall (if needed)

```bash
# Allow HTTP traffic
ufw allow 80/tcp
ufw allow 443/tcp

# Or using iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Option 2: Deploy Directly on VM/LXC (Without Docker)

### Step 1: Install Node.js and Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install nginx
apt-get install -y nginx

# Install PM2 for process management (optional)
npm install -g pm2
```

### Step 2: Build the Application

```bash
cd /opt/cretewerkz-app
npm install
npm run build
```

### Step 3: Configure Nginx

```bash
# Copy nginx config
cp nginx.conf /etc/nginx/sites-available/cretewerkz-app
ln -s /etc/nginx/sites-available/cretewerkz-app /etc/nginx/sites-enabled/

# Update nginx.conf to point to /opt/cretewerkz-app/dist
# Edit the root path in the nginx config

# Test and reload nginx
nginx -t
systemctl reload nginx
```

### Step 4: Set Up Auto-Start (Optional)

```bash
# Create systemd service
cat > /etc/systemd/system/cretewerkz-app.service << EOF
[Unit]
Description=Cretewerkz App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cretewerkz-app
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cretewerkz-app
systemctl start cretewerkz-app
```

## Option 3: Deploy with SSL/HTTPS (Recommended for Production)

### Using Let's Encrypt with Certbot

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### Update Docker Compose for HTTPS

1. Mount SSL certificates:
```yaml
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

2. Update nginx.conf to include SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    # ... rest of config
}

server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## Maintenance Commands

```bash
# View logs
docker compose logs -f

# Restart container
docker compose restart

# Stop container
docker compose down

# Update application
git pull  # or copy new files
docker compose up -d --build

# Clean up old images
docker system prune -a
```

## Backup

```bash
# Backup the entire application directory
tar -czf cretewerkz-backup-$(date +%Y%m%d).tar.gz /opt/cretewerkz-app

# Backup Docker volumes (if using volumes)
docker run --rm -v cretewerkz-data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
```

## Troubleshooting

### Container won't start
```bash
docker compose logs cretewerkz-app
docker compose ps
```

### Port already in use
```bash
# Check what's using port 80
netstat -tulpn | grep :80
# Or change port in docker-compose.yml
```

### Build fails
```bash
# Check Node version
node -v  # Should be 18+
# Clear cache and rebuild
docker compose build --no-cache
```

### Can't access from network
- Check Proxmox firewall rules
- Check VM/container firewall
- Verify port forwarding in Proxmox
- Check network configuration

## Performance Optimization

1. **Enable caching** (already in nginx.conf)
2. **Use CDN** for static assets
3. **Enable compression** (gzip is enabled)
4. **Monitor resources**: `docker stats`
5. **Set resource limits** in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

## Monitoring

Set up monitoring with:
- Prometheus + Grafana
- Portainer for Docker management
- Uptime monitoring (UptimeRobot, etc.)

## Next Steps

1. Set up domain name and DNS
2. Configure SSL certificates
3. Set up automated backups
4. Configure monitoring and alerts
5. Set up CI/CD pipeline for automated deployments


