#!/bin/bash
echo "🔍 Checking Cloudflare Tunnel Status"
echo "===================================="
echo ""

# Check if cloudflared is installed
if command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared is installed: $(cloudflared --version | head -1)"
else
    echo "❌ cloudflared is not installed"
fi

echo ""

# Check if service is running
if systemctl is-active --quiet cloudflared 2>/dev/null; then
    echo "✅ cloudflared service is running"
    systemctl status cloudflared --no-pager -l | head -15
else
    echo "❌ cloudflared service is NOT running"
fi

echo ""

# Check configuration file
if [ -f "/etc/cloudflared/config.yml" ]; then
    echo "✅ Configuration file exists"
    echo "Contents:"
    cat /etc/cloudflared/config.yml
else
    echo "❌ Configuration file not found at /etc/cloudflared/config.yml"
fi

echo ""

# Check credentials file
TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
if [ -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
    echo "✅ Credentials file exists"
else
    echo "❌ Credentials file not found at /etc/cloudflared/${TUNNEL_ID}.json"
fi

echo ""

# Test connectivity to app server
echo "🔍 Testing connectivity to app server (192.168.2.189:80)..."
if curl -s --connect-timeout 5 http://192.168.2.189 > /dev/null 2>&1; then
    echo "✅ App server is reachable"
else
    echo "❌ Cannot reach app server at http://192.168.2.189"
fi

echo ""

# Check recent logs
echo "📋 Recent tunnel logs:"
journalctl -u cloudflared -n 20 --no-pager 2>/dev/null || echo "No logs found"
