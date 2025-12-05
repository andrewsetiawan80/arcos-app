#!/bin/bash

# Cretewerkz App Deployment Script for Proxmox
# This script automates the deployment process

set -e

echo "🚀 Cretewerkz App Deployment Script"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Build and deploy
echo ""
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker compose build

echo ""
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down || true

echo ""
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for container to be healthy...${NC}"
sleep 5

# Check if container is running
if docker ps | grep -q arcos-app; then
    echo -e "${GREEN}✓ Container is running${NC}"
else
    echo -e "${RED}❌ Container failed to start. Check logs with: docker compose logs${NC}"
    exit 1
fi

# Get container IP or host IP
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' arcos-app 2>/dev/null || echo "localhost")

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "📋 Deployment Information:"
echo "   - Container: arcos-app"
echo "   - Status: Running"
echo "   - Access: http://localhost"
echo "   - Health: http://localhost/health"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose logs -f"
echo "   - Stop: docker compose down"
echo "   - Restart: docker compose restart"
echo "   - Update: ./deploy.sh"
echo ""


