#!/bin/bash

# Start Cloudflare Tunnel (without sudo - running as root)
# Run this on the connector machine

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
APP_SERVER="192.168.2.189"
APP_PORT="80"
DOMAIN="cretewerkz.com"

echo "🚀 Starting Cloudflare Tunnel (as root)"
echo "========================================"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared not found"
    echo "Install it first:"
    echo "  wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared"
    echo "  chmod +x /usr/local/bin/cloudflared"
    exit 1
fi

echo "✅ cloudflared found: $(cloudflared --version | head -1)"
echo ""

# Check configuration
if [ ! -f "/etc/cloudflared/config.yml" ]; then
    echo "❌ Configuration file not found at /etc/cloudflared/config.yml"
    echo ""
    echo "Creating configuration..."
    mkdir -p /etc/cloudflared
    
    cat > /etc/cloudflared/config.yml <<EOF
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
else
    echo "✅ Configuration file exists"
fi

echo ""

# Check credentials
if [ ! -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
    echo "❌ Credentials file not found"
    echo "Run: cloudflared tunnel login"
    exit 1
fi

echo "✅ Credentials file exists"
echo ""

# Test connectivity
echo "🔍 Testing app server connectivity..."
if curl -s --connect-timeout 5 "http://$APP_SERVER:$APP_PORT" > /dev/null 2>&1; then
    echo "✅ App server is reachable"
else
    echo "⚠️  Cannot reach app server (may still work)"
fi

echo ""

# Stop any existing cloudflared processes
echo "🛑 Stopping existing tunnel processes..."
pkill -f "cloudflared.*tunnel" 2>/dev/null || true
sleep 2

# Check if systemd service exists
if [ -f "/etc/systemd/system/cloudflared.service" ]; then
    echo "📋 Systemd service found"
    echo ""
    echo "Starting service..."
    systemctl daemon-reload
    systemctl start cloudflared
    sleep 3
    
    if systemctl is-active --quiet cloudflared; then
        echo "✅ Tunnel service is running!"
        echo ""
        systemctl status cloudflared --no-pager -l | head -20
    else
        echo "❌ Service failed to start"
        echo ""
        echo "Recent logs:"
        journalctl -u cloudflared -n 20 --no-pager
        echo ""
        echo "Trying to run tunnel manually..."
        echo ""
    fi
else
    echo "⚠️  Systemd service not found"
    echo "Running tunnel manually..."
    echo ""
fi

# Run tunnel manually (if service didn't work)
if ! systemctl is-active --quiet cloudflared 2>/dev/null; then
    echo "🚀 Starting tunnel manually..."
    echo ""
    echo "Configuration:"
    cat /etc/cloudflared/config.yml
    echo ""
    echo "Starting cloudflared tunnel..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Run in background
    nohup cloudflared tunnel --config /etc/cloudflared/config.yml run > /tmp/cloudflared.log 2>&1 &
    TUNNEL_PID=$!
    
    sleep 5
    
    if ps -p $TUNNEL_PID > /dev/null; then
        echo "✅ Tunnel started (PID: $TUNNEL_PID)"
        echo ""
        echo "Logs:"
        tail -20 /tmp/cloudflared.log
        echo ""
        echo "To view logs: tail -f /tmp/cloudflared.log"
        echo "To stop: kill $TUNNEL_PID"
    else
        echo "❌ Tunnel failed to start"
        echo ""
        echo "Error logs:"
        cat /tmp/cloudflared.log
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   Tunnel ID: $TUNNEL_ID"
echo "   Domain: $DOMAIN"
echo "   App Server: http://$APP_SERVER:$APP_PORT"
echo ""
echo "Test: curl https://$DOMAIN"


