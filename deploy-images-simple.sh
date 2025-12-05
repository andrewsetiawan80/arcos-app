#!/bin/bash

REMOTE_HOST="192.168.2.189"
REMOTE_USER="root"
REMOTE_DIR="/var/www/cretewerkz"

echo "🖼️  Deploying images to Proxmox"
echo "======================================"
echo "   Host: $REMOTE_HOST"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR/assets/images"

# Copy inspiration folder
echo "📦 Copying inspiration images..."
scp -r dist/assets/images/inspiration $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/assets/images/

echo ""
echo "✅ Image deployment complete!"
echo "   Images available at: http://$REMOTE_HOST/assets/images/inspiration/"
