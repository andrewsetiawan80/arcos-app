#!/bin/bash

# Full stack deployment script with password authentication
# Deploys Frontend + Backend + Database to Proxmox LXC

set -e

REMOTE_HOST="192.168.2.189"
REMOTE_USER="root"
REMOTE_PASS="Andrewis0380"
REMOTE_PATH="/opt/cretewerkz-app"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying Full Stack Arqon App to Proxmox${NC}"
echo "===================================="
echo "   Host: $REMOTE_HOST"
echo "   User: $REMOTE_USER"
echo "   Path: $REMOTE_PATH"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}📦 Installing sshpass for password authentication...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install hudochenkov/sshpass/sshpass 2>/dev/null || echo "Please install manually: brew install hudochenkov/sshpass/sshpass"
        else
            echo -e "${RED}❌ Please install sshpass: brew install hudochenkov/sshpass/sshpass${NC}"
            exit 1
        fi
    else
        # Linux
        apt-get update && apt-get install -y sshpass || yum install -y sshpass
    fi
fi

# Function to run SSH commands with password
ssh_cmd() {
    sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$REMOTE_HOST "$@"
}

# Function to run SCP with password
scp_cmd() {
    sshpass -p "$REMOTE_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$@"
}

# Test connection
echo -e "${YELLOW}🔌 Testing connection...${NC}"
if ssh_cmd "echo 'Connected successfully'"; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}❌ Connection failed. Please check credentials and network.${NC}"
    exit 1
fi

# Check and install Docker
echo -e "${YELLOW}🐳 Checking Docker installation...${NC}"
if ssh_cmd "command -v docker &> /dev/null"; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
else
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    ssh_cmd << 'ENDSSH'
        curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
        sh /tmp/get-docker.sh
        apt-get install -y docker-compose-plugin || (apt-get update && apt-get install -y docker-compose-plugin)
        rm /tmp/get-docker.sh
ENDSSH
    echo -e "${GREEN}✓ Docker installed${NC}"
fi

# Check Docker Compose
if ssh_cmd "docker compose version &> /dev/null"; then
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
else
    echo -e "${YELLOW}📦 Installing Docker Compose plugin...${NC}"
    ssh_cmd "apt-get update && apt-get install -y docker-compose-plugin"
fi

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}📝 Creating .env.production file...${NC}"
    cat > .env.production << EOF
DB_PASSWORD=arqon_secure_password_$(date +%s)
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=http://$REMOTE_HOST,http://localhost:80,http://localhost
VITE_API_URL=http://localhost:3001/api
EOF
    echo -e "${GREEN}✓ Created .env.production with secure random values${NC}"
fi

# Build frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build failed. dist/ directory not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Build backend
echo -e "${YELLOW}📦 Building backend...${NC}"
cd backend
npm install
npm run build
cd ..

if [ ! -d "backend/dist" ]; then
    echo -e "${RED}❌ Backend build failed. backend/dist/ directory not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend built successfully${NC}"

# Create remote directory
echo -e "${YELLOW}📁 Creating remote directory...${NC}"
ssh_cmd "mkdir -p $REMOTE_PATH"

# Create deployment tarball
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar czf /tmp/cretewerkz-fullstack-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    dist/ \
    backend/dist/ \
    backend/package.json \
    backend/tsconfig.json \
    backend/Dockerfile \
    backend/.dockerignore \
    docker-compose.yml \
    nginx.conf \
    .env.production \
    cretewerkz-fullstack.service 2>/dev/null || \
tar czf /tmp/cretewerkz-fullstack-deploy.tar.gz \
    dist/ \
    backend/dist/ \
    backend/package.json \
    backend/tsconfig.json \
    backend/Dockerfile \
    backend/.dockerignore \
    docker-compose.yml \
    nginx.conf \
    .env.production \
    cretewerkz-fullstack.service

# Transfer tarball
echo -e "${YELLOW}📤 Transferring files to server...${NC}"
scp_cmd /tmp/cretewerkz-fullstack-deploy.tar.gz root@$REMOTE_HOST:/tmp/

# Extract and deploy on remote
echo -e "${YELLOW}🚀 Deploying on remote server...${NC}"
ssh_cmd << ENDSSH
    set -e
    cd $REMOTE_PATH
    
    echo "Extracting files..."
    tar xzf /tmp/cretewerkz-fullstack-deploy.tar.gz
    rm /tmp/cretewerkz-fullstack-deploy.tar.gz
    
    echo "Stopping existing containers..."
    docker compose down || true
    
    echo "Starting all services..."
    docker compose up -d
    
    echo "Waiting for services to start..."
    sleep 15
    
    echo "Checking service status..."
    docker compose ps
ENDSSH

# Clean up local tarball
rm /tmp/cretewerkz-fullstack-deploy.tar.gz

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📋 Access Information:${NC}"
echo "   🌐 Frontend:  http://$REMOTE_HOST"
echo "   🔌 Backend:   http://$REMOTE_HOST:3001"
echo "   🗄️  Database:  localhost:5432 (internal)"
echo ""
echo -e "${BLUE}🔐 Default Admin Credentials:${NC}"
echo "   Email:    admin@arqon.com"
echo "   Password: admin123"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   View logs: ssh root@$REMOTE_HOST 'cd $REMOTE_PATH && docker compose logs -f'"
echo "   Restart:   ssh root@$REMOTE_HOST 'cd $REMOTE_PATH && docker compose restart'"
echo "   Stop:      ssh root@$REMOTE_HOST 'cd $REMOTE_PATH && docker compose down'"
echo "   Status:    ssh root@$REMOTE_HOST 'cd $REMOTE_PATH && docker compose ps'"
echo ""
