# Quick Deploy Guide for Proxmox

## Fastest Method: Docker Compose

### 1. On Your Proxmox VM/Container:

```bash
# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Transfer your app files (use SCP, git clone, or Proxmox file manager)
# For example:
cd /opt
git clone <your-repo> cretewerkz-app
# OR
# scp -r ./cretewerkz-app root@proxmox-ip:/opt/

# Navigate to app directory
cd /opt/cretewerkz-app

# Deploy
chmod +x deploy.sh
./deploy.sh
```

### 2. Access Your App

- Open browser: `http://your-proxmox-ip`
- Health check: `http://your-proxmox-ip/health`

### 3. Common Commands

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Update (after pulling new code)
docker compose up -d --build
```

## Manual Steps (If Needed)

### Step 1: Create VM/Container in Proxmox
1. Go to Proxmox web interface
2. Create VM (Ubuntu 22.04) or LXC container
3. Allocate: 2GB RAM, 2 CPU, 20GB disk
4. Install Ubuntu/Debian

### Step 2: Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt-get install -y docker-compose-plugin
```

### Step 3: Transfer Files
```bash
# From your local machine
scp -r ./cretewerkz-app root@proxmox-ip:/opt/
```

### Step 4: Deploy
```bash
cd /opt/cretewerkz-app
./deploy.sh
```

## Troubleshooting

**Port 80 already in use?**
```bash
# Change port in docker-compose.yml to 8080:80
# Then access via http://your-ip:8080
```

**Can't access from network?**
```bash
# Check firewall
ufw allow 80/tcp

# Check Proxmox firewall rules
# Ensure VM/container has network access
```

**Container won't start?**
```bash
docker compose logs
docker compose ps
```

## Next: Add SSL/HTTPS

```bash
# Install certbot
apt-get install -y certbot

# Get certificate (if you have a domain)
certbot certonly --standalone -d your-domain.com

# Update nginx.conf to use SSL
# Update docker-compose.yml to mount SSL certs
```


