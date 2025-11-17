#!/bin/bash

# Complete Cloudflare Tunnel Setup Script
# Run this on the connector machine (192.168.2.145)
# Usage: ./setup-tunnel-complete.sh

set -e

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
APP_SERVER="192.168.2.189"
APP_PORT="80"
DOMAIN="cretewerkz.com"

echo "🚀 Complete Cloudflare Tunnel Setup"
echo "===================================="
echo "Tunnel ID: $TUNNEL_ID"
echo "Domain: $DOMAIN"
echo "App Server: $APP_SERVER:$APP_PORT"
echo ""

# Step 1: Install cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /tmp/cloudflared
    chmod +x /tmp/cloudflared
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    echo "✅ cloudflared installed"
else
    echo "✅ cloudflared already installed: $(cloudflared --version)"
fi

# Step 2: Authenticate (if needed)
if [ ! -f "$HOME/.cloudflared/$TUNNEL_ID.json" ] && [ ! -f "/etc/cloudflared/$TUNNEL_ID.json" ]; then
    echo ""
    echo "🔐 Authenticating cloudflared..."
    echo "This will open a browser window. Please log in with your Cloudflare account."
    cloudflared tunnel login
    echo "✅ Authentication complete"
else
    echo "✅ Credentials file found"
fi

# Step 3: Create config directory
echo ""
echo "📁 Creating configuration..."
sudo mkdir -p /etc/cloudflared

# Step 4: Create configuration file
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

# Copy credentials file if it's in home directory
if [ -f "$HOME/.cloudflared/$TUNNEL_ID.json" ]; then
    sudo cp "$HOME/.cloudflared/$TUNNEL_ID.json" "/etc/cloudflared/$TUNNEL_ID.json"
    sudo chmod 600 "/etc/cloudflared/$TUNNEL_ID.json"
    echo "✅ Credentials file copied to /etc/cloudflared/"
fi

echo "✅ Configuration file created at /etc/cloudflared/config.yml"

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
echo "⚙️  Creating systemd service..."
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

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cloudflared
echo "✅ Systemd service created and enabled"

# Step 7: Start the service
echo ""
echo "🚀 Starting cloudflared service..."
sudo systemctl restart cloudflared
sleep 3

# Step 8: Check status
if sudo systemctl is-active --quiet cloudflared; then
    echo "✅ cloudflared service is running"
    echo ""
    sudo systemctl status cloudflared --no-pager -l | head -15
else
    echo "❌ cloudflared service failed to start"
    echo "Check logs: sudo journalctl -u cloudflared -n 50"
    exit 1
fi

# Step 9: Configure DNS
echo ""
echo "🌐 Configuring DNS records..."
if cloudflared tunnel route dns $TUNNEL_ID $DOMAIN 2>&1; then
    echo "✅ DNS record for $DOMAIN configured"
else
    echo "⚠️  DNS configuration may need manual setup"
fi

if cloudflared tunnel route dns $TUNNEL_ID www.$DOMAIN 2>&1; then
    echo "✅ DNS record for www.$DOMAIN configured"
else
    echo "⚠️  DNS configuration may need manual setup"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   Tunnel ID: $TUNNEL_ID"
echo "   Domain: $DOMAIN"
echo "   App Server: http://$APP_SERVER:$APP_PORT"
echo ""
echo "📝 Next steps:"
echo "1. Verify DNS records in Cloudflare Dashboard:"
echo "   https://dash.cloudflare.com → DNS → Records"
echo "   Should show CNAME records pointing to: ${TUNNEL_ID}.cfargotunnel.com"
echo ""
echo "2. Test your domain:"
echo "   curl https://$DOMAIN"
echo ""
echo "3. Monitor tunnel:"
echo "   sudo systemctl status cloudflared"
echo "   sudo journalctl -u cloudflared -f"
echo ""


