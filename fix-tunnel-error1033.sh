#!/bin/bash

# Fix Cloudflare Tunnel Error 1033
# This script sets up the tunnel properly on the connector machine

set -e

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
APP_SERVER="192.168.2.189"
APP_PORT="80"
DOMAIN="cretewerkz.com"

echo "🔧 Fixing Cloudflare Tunnel Error 1033"
echo "======================================"
echo ""

# Step 1: Install cloudflared if needed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /tmp/cloudflared
    chmod +x /tmp/cloudflared
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    echo "✅ cloudflared installed"
else
    echo "✅ cloudflared already installed"
fi

# Step 2: Create config directory
sudo mkdir -p /etc/cloudflared

# Step 3: Create configuration file
echo "📝 Creating configuration file..."
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://$APP_SERVER:$APP_PORT
  
  - hostname: www.$DOMAIN
    service: http://$APP_SERVER:$APP_PORT
  
  - service: http_status:404
EOF

echo "✅ Configuration file created"

# Step 4: Check credentials
if [ ! -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
    echo ""
    echo "⚠️  Credentials file not found!"
    echo "You need to authenticate cloudflared first."
    echo ""
    echo "Run this command:"
    echo "  cloudflared tunnel login"
    echo ""
    echo "This will:"
    echo "  1. Open a browser window"
    echo "  2. Ask you to log in to Cloudflare"
    echo "  3. Download the credentials file"
    echo ""
    echo "After authentication, run this script again or:"
    echo "  sudo systemctl start cloudflared"
    exit 1
fi

echo "✅ Credentials file found"

# Step 5: Test connectivity
echo ""
echo "🔍 Testing connectivity to app server..."
if curl -s --connect-timeout 5 "http://$APP_SERVER:$APP_PORT" > /dev/null; then
    echo "✅ App server is reachable"
else
    echo "⚠️  Warning: Cannot reach app server at http://$APP_SERVER:$APP_PORT"
    echo "   Please verify the server is running and accessible"
fi

# Step 6: Create systemd service
echo ""
echo "⚙️  Setting up systemd service..."
sudo tee /etc/systemd/system/cloudflared.service > /dev/null <<EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cloudflared

echo "✅ Systemd service configured"

# Step 7: Stop any existing tunnel processes
echo ""
echo "🛑 Stopping any existing tunnel processes..."
sudo systemctl stop cloudflared 2>/dev/null || true
pkill -f cloudflared 2>/dev/null || true
sleep 2

# Step 8: Start the tunnel
echo ""
echo "🚀 Starting cloudflared tunnel..."
sudo systemctl start cloudflared
sleep 5

# Step 9: Check status
echo ""
echo "📊 Tunnel Status:"
if sudo systemctl is-active --quiet cloudflared; then
    echo "✅ Tunnel is running!"
    echo ""
    sudo systemctl status cloudflared --no-pager -l | head -20
else
    echo "❌ Tunnel failed to start"
    echo ""
    echo "Recent logs:"
    sudo journalctl -u cloudflared -n 30 --no-pager
    echo ""
    echo "Common issues:"
    echo "  1. Credentials file missing or invalid"
    echo "  2. Network connectivity issues"
    echo "  3. App server not accessible"
    exit 1
fi

echo ""
echo "✅ Tunnel setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Wait a few minutes for tunnel to establish connection"
echo "  2. Test: curl https://$DOMAIN"
echo "  3. Monitor logs: sudo journalctl -u cloudflared -f"
echo ""


