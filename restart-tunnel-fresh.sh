#!/bin/bash

# Restart Cloudflare Tunnel Fresh
# This will stop and restart the tunnel cleanly

set -e

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"

echo "🔄 Restarting Cloudflare Tunnel"
echo "================================"
echo ""

# Stop all cloudflared processes
echo "1. Stopping existing tunnel processes..."
killall cloudflared 2>/dev/null || pkill -f "cloudflared.*tunnel" || true
sleep 3

# Verify stopped
if ps aux | grep -v grep | grep -q "cloudflared"; then
    echo "⚠️  Some cloudflared processes still running, forcing kill..."
    killall -9 cloudflared 2>/dev/null || true
    sleep 2
fi

echo "✅ All tunnel processes stopped"
echo ""

# Verify configuration
echo "2. Verifying configuration..."
if [ ! -f "/etc/cloudflared/config.yml" ]; then
    echo "❌ Configuration file not found!"
    exit 1
fi

if [ ! -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
    echo "❌ Credentials file not found!"
    echo "Run: cloudflared tunnel login"
    exit 1
fi

echo "✅ Configuration verified"
echo ""

# Validate configuration
echo "3. Validating tunnel configuration..."
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate

echo ""

# Test app server
echo "4. Testing app server connectivity..."
if curl -s --connect-timeout 5 http://192.168.2.189 > /dev/null 2>&1; then
    echo "✅ App server is reachable"
else
    echo "⚠️  Warning: Cannot reach app server"
fi

echo ""

# Start tunnel with verbose logging
echo "5. Starting tunnel with verbose logging..."
echo ""
echo "Configuration:"
cat /etc/cloudflared/config.yml
echo ""
echo "Starting tunnel..."
echo "Watch for connection messages..."
echo ""

# Run tunnel in foreground first to see errors
cloudflared tunnel --config /etc/cloudflared/config.yml run --loglevel debug


