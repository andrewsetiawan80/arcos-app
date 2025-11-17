#!/bin/bash

# Cloudflare Zero Trust Tunnel Setup Script
# Run this script on the cloudflared connector machine (192.168.2.145)
# Usage: ./setup-cloudflare-tunnel.sh YOUR_TUNNEL_ID

set -e

TUNNEL_ID=${1:-mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9}
APP_SERVER="192.168.2.189"
APP_PORT="80"
DOMAIN="cretewerkz.com"

echo "Using Tunnel ID: $TUNNEL_ID"

echo "🚀 Setting up Cloudflare Zero Trust Tunnel"
echo "=========================================="
echo "Tunnel ID: $TUNNEL_ID"
echo "App Server: $APP_SERVER:$APP_PORT"
echo "Domain: $DOMAIN"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    
    # Detect OS
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O /tmp/cloudflared.deb
        sudo dpkg -i /tmp/cloudflared.deb || sudo apt-get install -f -y
        rm /tmp/cloudflared.deb
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm -O /tmp/cloudflared.rpm
        sudo rpm -i /tmp/cloudflared.rpm || true
        rm /tmp/cloudflared.rpm
    else
        # Generic Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /tmp/cloudflared
        sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
        sudo chmod +x /usr/local/bin/cloudflared
    fi
    
    echo "✅ cloudflared installed"
else
    echo "✅ cloudflared is already installed"
fi

# Create config directory
echo "📁 Creating config directory..."
sudo mkdir -p /etc/cloudflared

# Create configuration file
echo "📝 Creating tunnel configuration..."
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

# Check if credentials file exists
if [ ! -f "/etc/cloudflared/$TUNNEL_ID.json" ]; then
    echo ""
    echo "⚠️  Credentials file not found!"
    echo "Please authenticate cloudflared first:"
    echo "  sudo cloudflared tunnel login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Test connectivity to app server
echo ""
echo "🔍 Testing connectivity to app server..."
if curl -s --connect-timeout 5 "http://$APP_SERVER:$APP_PORT" > /dev/null; then
    echo "✅ App server is reachable"
else
    echo "⚠️  Warning: Cannot reach app server at http://$APP_SERVER:$APP_PORT"
    echo "   Please verify the server is running and accessible"
fi

# Create systemd service
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

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable cloudflared

echo "✅ Systemd service created and enabled"

# Start the service
echo ""
echo "🚀 Starting cloudflared service..."
sudo systemctl restart cloudflared

# Wait a moment for service to start
sleep 2

# Check service status
if sudo systemctl is-active --quiet cloudflared; then
    echo "✅ cloudflared service is running"
else
    echo "❌ cloudflared service failed to start"
    echo "Check logs with: sudo journalctl -u cloudflared -n 50"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure DNS in Cloudflare Dashboard:"
echo "   - Go to: https://dash.cloudflare.com → DNS → Records"
echo "   - Add CNAME record: @ → $TUNNEL_ID.cfargotunnel.com (Proxied)"
echo "   - Add CNAME record: www → $TUNNEL_ID.cfargotunnel.com (Proxied)"
echo ""
echo "2. Monitor tunnel status:"
echo "   sudo systemctl status cloudflared"
echo ""
echo "3. View logs:"
echo "   sudo journalctl -u cloudflared -f"
echo ""
echo "4. Test your domain:"
echo "   curl https://$DOMAIN"
echo ""

