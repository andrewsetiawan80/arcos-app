#!/bin/bash

# Diagnose Cloudflare Tunnel Error 1033
# Run this on the connector machine

echo "🔍 Diagnosing Cloudflare Tunnel Error 1033"
echo "=========================================="
echo ""

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"

# 1. Check if process is running
echo "1. Checking tunnel process..."
if ps aux | grep -v grep | grep -q "cloudflared.*tunnel"; then
    echo "✅ Tunnel process is running"
    ps aux | grep -v grep | grep cloudflared
else
    echo "❌ Tunnel process is NOT running"
fi

echo ""

# 2. Check configuration file
echo "2. Checking configuration..."
if [ -f "/etc/cloudflared/config.yml" ]; then
    echo "✅ Config file exists"
    echo "Contents:"
    cat /etc/cloudflared/config.yml
else
    echo "❌ Config file not found"
fi

echo ""

# 3. Check credentials file
echo "3. Checking credentials..."
if [ -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
    echo "✅ Credentials file exists"
    ls -la /etc/cloudflared/${TUNNEL_ID}.json
    
    # Check if file is valid JSON
    if python3 -m json.tool /etc/cloudflared/${TUNNEL_ID}.json > /dev/null 2>&1 || python -m json.tool /etc/cloudflared/${TUNNEL_ID}.json > /dev/null 2>&1; then
        echo "✅ Credentials file is valid JSON"
    else
        echo "⚠️  Credentials file may be invalid"
    fi
else
    echo "❌ Credentials file not found"
    echo "   Expected: /etc/cloudflared/${TUNNEL_ID}.json"
fi

echo ""

# 4. Test tunnel connection
echo "4. Testing tunnel connection..."
echo "Running tunnel validation..."
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate 2>&1

echo ""

# 5. Check tunnel info
echo "5. Checking tunnel info..."
cloudflared tunnel info $TUNNEL_ID 2>&1 || echo "⚠️  Cannot get tunnel info"

echo ""

# 6. Test app server connectivity
echo "6. Testing app server connectivity..."
if curl -s --connect-timeout 5 http://192.168.2.189 > /dev/null 2>&1; then
    echo "✅ App server is reachable"
else
    echo "❌ Cannot reach app server"
fi

echo ""

# 7. Check DNS resolution
echo "7. Checking DNS resolution..."
echo "Testing cretewerkz.com DNS..."
dig cretewerkz.com +short || nslookup cretewerkz.com || echo "DNS check failed"

echo ""

# 8. Check for connection errors
echo "8. Checking for connection errors..."
echo "Recent cloudflared output (if available):"
if [ -f "/tmp/cloudflared.log" ]; then
    tail -30 /tmp/cloudflared.log
else
    echo "No log file found at /tmp/cloudflared.log"
    echo "If tunnel is running, check with: ps aux | grep cloudflared"
fi

echo ""

# 9. Recommendations
echo "📋 RECOMMENDATIONS:"
echo "==================="
echo ""
echo "If tunnel process is running but Error 1033 persists:"
echo ""
echo "1. Restart tunnel:"
echo "   killall cloudflared"
echo "   cloudflared tunnel --config /etc/cloudflared/config.yml run"
echo ""
echo "2. Check tunnel authentication:"
echo "   cloudflared tunnel login"
echo ""
echo "3. Verify tunnel ID matches Cloudflare dashboard:"
echo "   https://one.dash.cloudflare.com → Networks → Tunnels"
echo ""
echo "4. Check DNS records are correct:"
echo "   cretewerkz.com → ${TUNNEL_ID}.cfargotunnel.com (Proxied)"
echo ""
echo "5. Wait 5-10 minutes after DNS changes"
echo ""


