#!/bin/bash

# Full stack deployment script for Arqon App
# This builds and deploys: Frontend, Backend API, and PostgreSQL Database

set -e

echo "🚀 Starting full stack deployment of Arqon App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found. Creating from template..."
    cp .env.production .env.production.example 2>/dev/null || true
    echo ""
    echo "Please edit .env.production and set:"
    echo "  - DB_PASSWORD (strong password for database)"
    echo "  - JWT_SECRET (random secret, at least 32 characters)"
    echo "  - CORS_ORIGIN (your domain/IP)"
    echo ""
    read -p "Press Enter to continue after editing .env.production..."
fi

# Build frontend
echo ""
echo "📦 Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Frontend build failed. dist/ directory not found."
    exit 1
fi

echo "✅ Frontend built successfully"

# Build backend
echo ""
echo "📦 Building backend..."
cd backend
npm install
npm run build
cd ..

if [ ! -d "backend/dist" ]; then
    echo "❌ Backend build failed. backend/dist/ directory not found."
    exit 1
fi

echo "✅ Backend built successfully"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker compose down

# Start all services
echo ""
echo "🚀 Starting all services (PostgreSQL, Backend, Frontend)..."
docker compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services running:"
echo "  🌐 Frontend:  http://localhost (or your server IP)"
echo "  🔌 Backend:   http://localhost:3001"
echo "  🗄️  Database:  localhost:5432"
echo ""
echo "Default admin credentials:"
echo "  Email:    admin@arqon.com"
echo "  Password: admin123"
echo ""
echo "View logs with: docker compose logs -f"
echo "Stop services: docker compose down"

