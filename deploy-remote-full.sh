#!/bin/bash

# Remote deployment script for full stack (Frontend + Backend + Database)
# Usage: ./deploy-remote-full.sh [user@]hostname

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 [user@]hostname"
    echo "Example: $0 root@192.168.2.189"
    exit 1
fi

REMOTE_HOST=$1
REMOTE_DIR="/opt/cretewerkz-app"

echo "🚀 Deploying full stack to $REMOTE_HOST..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found. Creating from template..."
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
    else
        cat > .env.production << EOF
DB_PASSWORD=arqon_secure_password_change_me
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
CORS_ORIGIN=http://localhost:80,http://localhost
VITE_API_URL=http://localhost:3001/api
EOF
    fi
    echo "Please edit .env.production and set secure passwords, then run this script again."
    exit 1
fi

# Build frontend locally
echo "📦 Building frontend..."
npm run build

# Build backend locally
echo "📦 Building backend..."
cd backend
npm install
npm run build
cd ..

# Create deployment archive
echo "📦 Creating deployment package..."
tar czf /tmp/cretewerkz-full-deploy.tar.gz \
    dist/ \
    backend/dist/ \
    backend/package.json \
    backend/tsconfig.json \
    docker-compose.yml \
    nginx.conf \
    .env.production \
    deploy-full.sh \
    --exclude='node_modules' \
    --exclude='.git'

# Transfer to remote
echo "📤 Transferring files to $REMOTE_HOST..."
scp /tmp/cretewerkz-full-deploy.tar.gz $REMOTE_HOST:/tmp/

# Extract and deploy on remote
echo "🚀 Deploying on remote server..."
ssh $REMOTE_HOST << EOF
set -e

# Create directory
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR

# Extract files
tar xzf /tmp/cretewerkz-full-deploy.tar.gz
rm /tmp/cretewerkz-full-deploy.tar.gz

# Install backend dependencies in container (if needed)
# The Dockerfile handles this, but we can pre-install

# Stop existing containers
docker compose down 2>/dev/null || true

# Start all services
docker compose up -d

# Wait for services
sleep 10

# Check status
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo "Services running on $REMOTE_HOST"
echo "  🌐 Frontend:  http://$REMOTE_HOST"
echo "  🔌 Backend:   http://$REMOTE_HOST:3001"
echo ""
echo "View logs: docker compose logs -f"
EOF

echo ""
echo "✅ Remote deployment complete!"
echo ""
echo "Access your app at: http://${REMOTE_HOST#*@}"
echo "Default admin: admin@arqon.com / admin123"

