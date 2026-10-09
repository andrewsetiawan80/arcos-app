#!/bin/bash
# Arcos App - Proxmox Deployment Script
# This script builds and deploys the app to your Proxmox server

set -e

# Configuration
PROXMOX_HOST="${PROXMOX_HOST:-192.168.2.170}"
PROXMOX_USER="${PROXMOX_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/arcos-app}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Arcos App - Proxmox Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Build frontend
echo -e "\n${YELLOW}[1/5] Building frontend...${NC}"
npm run build
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist folder not found after build${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 2: Build backend
echo -e "\n${YELLOW}[2/5] Building backend...${NC}"
cd backend
npm run build
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: backend dist folder not found after build${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Backend built successfully${NC}"

# Step 3: Copy files to Proxmox
echo -e "\n${YELLOW}[3/5] Copying files to Proxmox server...${NC}"
echo -e "Target: ${PROXMOX_USER}@${PROXMOX_HOST}:${DEPLOY_PATH}"

# Create deployment directory on remote
ssh ${PROXMOX_USER}@${PROXMOX_HOST} "mkdir -p ${DEPLOY_PATH}"

# Copy necessary files
rsync -avz --progress \
    dist/ \
    docker-compose.yml \
    nginx.conf \
    Dockerfile \
    ${PROXMOX_USER}@${PROXMOX_HOST}:${DEPLOY_PATH}/

# Copy backend folder
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.env' \
    backend/ \
    ${PROXMOX_USER}@${PROXMOX_HOST}:${DEPLOY_PATH}/backend/

echo -e "${GREEN}✓ Files copied successfully${NC}"

# Step 4: Create .env file on server if it doesn't exist
echo -e "\n${YELLOW}[4/5] Setting up environment...${NC}"
ssh ${PROXMOX_USER}@${PROXMOX_HOST} "cat > ${DEPLOY_PATH}/.env << 'ENVEOF'
# Arcos App Environment Variables
# Change these values in production!

# Database (PostgreSQL on separate container)
DB_PASSWORD=arcos_secure_password_change_me

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost,http://192.168.2.170,https://arcosworks.com

# Node environment
NODE_ENV=production
ENVEOF"
echo -e "${GREEN}✓ Environment file created (review and update secrets!)${NC}"

# Step 5: Deploy with Docker Compose
echo -e "\n${YELLOW}[5/5] Starting Docker containers...${NC}"
ssh ${PROXMOX_USER}@${PROXMOX_HOST} "cd ${DEPLOY_PATH} && docker compose down 2>/dev/null || true && docker compose up -d --build"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nApp available at:"
echo -e "  - Frontend: http://${PROXMOX_HOST}"
echo -e "  - Backend:  http://${PROXMOX_HOST}:3001"
echo -e "\n${YELLOW}⚠️  Don't forget to:${NC}"
echo -e "  1. Update JWT_SECRET in ${DEPLOY_PATH}/.env"
echo -e "  2. Update DB_PASSWORD to match your PostgreSQL password"
echo -e "  3. Configure your Cloudflare/DNS if using a domain"
echo -e "\nTo check logs:"
echo -e "  ssh ${PROXMOX_USER}@${PROXMOX_HOST} 'cd ${DEPLOY_PATH} && docker compose logs -f'"
