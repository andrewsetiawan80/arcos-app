#!/bin/bash

# Complete Cloudflare Tunnel Setup and Fix Script
# Run this on the connector machine (192.162.2.145)

set -e

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
APP_SERVER="192.168.2.189"
APP_PORT="80"
DOMAIN="cretewerkz.com"

echo "🔧 Complete Cloudflare Tunnel Setup"
echo "===================================="
echo "Tunnel ID: $TUNNEL_ID"
echo "App Server: $APP_SERVER:$APP_PORT"
echo "Domain: $DOMAIN"
echo ""

# Step 1: Install cloudflared
echo "📦 Step 1: Installing cloudflared..."
if ! command -v cloudflared &> /dev/null; then
    echo "Downloading cloudflared..."
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        ARCH="amd64"
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        ARCH="arm64"
    fi
    
    wget -q "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}" -O /tmp/cloudflared
    chmod +x /tmp/cloudflared
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    echo "✅ cloudflared installed: $(cloudflared --version | head -1)"
else
    echo "✅ cloudflared already installed: $(cloudflared --version | head -1)"
fi

# Step 2: Authenticate
echo ""
echo "🔐 Step 2: Checking authentication..."
if [ ! -f "/etc/cloudflared/${TUNNEL_ID}.json" ] && [ ! -f "$HOME/.cloudflared/${TUNNEL_ID}.json" ]; then
    echo "⚠️  Credentials file not found!"
    echo ""
    echo "You need to authenticate cloudflared."
    echo "This will open a browser window - please log in to Cloudflare."
    echo ""
    read -p "Press Enter to start authentication..."
    cloudflared tunnel login
    echo ""
    
    # Copy credentials to system location
    if [ -f "$HOME/.cloudflared/${TUNNEL_ID}.json" ]; then
        sudo mkdir -p /etc/cloudflared
        sudo cp "$HOME/.cloudflared/${TUNNEL_ID}.json" "/etc/cloudflared/${TUNNEL_ID}.json"
        sudo chmod 600 "/etc/cloudflared/${TUNNEL_ID}.json"
        echo "✅ Credentials file copied to /etc/cloudflared/"
    fi
else
    echo "✅ Credentials file found"
    if [ -f "$HOME/.cloudflared/${TUNNEL_ID}.json" ] && [ ! -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
        sudo mkdir -p /etc/cloudflared
        sudo cp "$HOME/.cloudflared/${TUNNEL_ID}.json" "/etc/cloudflared/${TUNNEL_ID}.json"
        sudo chmod 600 "/etc/cloudflared/${TUNNEL_ID}.json"
        echo "✅ Credentials file copied to /etc/cloudflared/"
    fi
fi

# Step 3: Create configuration
echo ""
echo "📝 Step 3: Creating configuration..."
sudo mkdir -p /etc/cloudflared

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

echo "✅ Configuration file created at /etc/cloudflared/config.yml"
echo ""
echo "Configuration:"
cat /etc/cloudflared/config.yml
echo ""

# Step 4: Test connectivity
echo ""
echo "🔍 Step 4: Testing connectivity..."
if curl -s --connect-timeout 5 "http://$APP_SERVER:$APP_PORT" > /dev/null 2>&1; then
    echo "✅ App server is reachable: http://$APP_SERVER:$APP_PORT"
else
    echo "❌ Cannot reach app server at http://$APP_SERVER:$APP_PORT"
    echo "   Please verify the server is running and accessible"
    echo "   Test manually: curl http://$APP_SERVER"
fi

# Step 5: Test tunnel connection
echo ""
echo "🧪 Step 5: Testing tunnel configuration..."
if cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate 2>&1; then
    echo "✅ Tunnel configuration is valid"
else
    echo "⚠️  Tunnel configuration validation failed"
fi

# Step 6: Stop any existing processes
echo ""
echo "🛑 Step 6: Stopping existing tunnel processes..."
sudo systemctl stop cloudflared 2>/dev/null || true
pkill -f "cloudflared.*tunnel" 2>/dev/null || true
sleep 2

# Step 7: Create systemd service
echo ""
echo "⚙️  Step 7: Creating systemd service..."
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
echo "✅ Systemd service created and enabled"

# Step 8: Start tunnel
echo ""
echo "🚀 Step 8: Starting tunnel..."
sudo systemctl start cloudflared
sleep 5

# Step 9: Check status
echo ""
echo "📊 Step 9: Checking tunnel status..."
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
    echo "Troubleshooting:"
    echo "1. Check credentials: ls -la /etc/cloudflared/${TUNNEL_ID}.json"
    echo "2. Verify config: cat /etc/cloudflared/config.yml"
    echo "3. Test manually: cloudflared tunnel --config /etc/cloudflared/config.yml run"
    exit 1
fi

# Step 10: Monitor for a few seconds
echo ""
echo "👀 Step 10: Monitoring tunnel (10 seconds)..."
sleep 10
echo ""
echo "Recent logs:"
sudo journalctl -u cloudflared -n 20 --no-pager

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   Tunnel ID: $TUNNEL_ID"
echo "   Domain: $DOMAIN"
echo "   App Server: http://$APP_SERVER:$APP_PORT"
echo "   Status: $(systemctl is-active cloudflared)"
echo ""
echo "📝 Next steps:"
echo "   1. Wait 1-2 minutes for tunnel to establish connection"
echo "   2. Test: curl https://$DOMAIN"
echo "   3. Monitor logs: sudo journalctl -u cloudflared -f"
echo ""


