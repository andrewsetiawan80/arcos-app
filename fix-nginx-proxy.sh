#!/bin/bash
# Quick script to fix and restart Nginx with correct proxy config

echo "🔧 Fixing Nginx proxy configuration..."

# Check if we can SSH to the server
if [ -z "$1" ]; then
    echo "Usage: $0 [user@]hostname"
    echo "Example: $0 root@192.168.2.189"
    exit 1
fi

REMOTE_HOST=$1

echo "📤 Uploading updated nginx.conf..."
scp nginx.conf $REMOTE_HOST:/tmp/nginx.conf

echo "🚀 Restarting frontend container..."
ssh $REMOTE_HOST << 'EOF'
cd /opt/cretewerkz-app
docker cp /tmp/nginx.conf arqon-frontend:/etc/nginx/conf.d/default.conf
docker exec arqon-frontend nginx -s reload
echo "✅ Nginx reloaded with new configuration"
EOF

echo ""
echo "✅ Done! Try accessing http://192.168.2.189/api/health now"


