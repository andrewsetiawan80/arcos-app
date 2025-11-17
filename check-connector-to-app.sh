#!/bin/bash

# Check if connector can reach app server
# Run this on connector (192.162.2.145)

APP_SERVER="192.168.2.189"
APP_PORT="80"

echo "🔍 Checking Connector → App Server Connectivity"
echo "==============================================="
echo ""

# 1. Test basic connectivity
echo "1. Testing basic connectivity..."
if ping -c 3 $APP_SERVER > /dev/null 2>&1; then
    echo "✅ Can ping app server"
else
    echo "❌ Cannot ping app server"
fi

echo ""

# 2. Test HTTP connectivity
echo "2. Testing HTTP connectivity..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://${APP_SERVER}:${APP_PORT}")
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo "✅ HTTP connection successful (Status: $HTTP_RESPONSE)"
    echo ""
    echo "Response preview:"
    curl -s "http://${APP_SERVER}:${APP_PORT}" | head -20
else
    echo "❌ HTTP connection failed (Status: $HTTP_RESPONSE)"
    echo ""
    echo "Full error:"
    curl -v "http://${APP_SERVER}:${APP_PORT}" 2>&1 | head -30
fi

echo ""
echo ""

# 3. Test from connector's perspective
echo "3. Testing from connector..."
echo "Connector IP check:"
hostname -I || ip addr show | grep "inet " | grep -v "127.0.0.1"

echo ""
echo "Testing app server from connector:"
curl -v "http://${APP_SERVER}:${APP_PORT}" 2>&1 | grep -E "Connected|HTTP|Host|Connection"

echo ""
echo ""

# 4. Check tunnel configuration
echo "4. Checking tunnel configuration..."
if [ -f "/etc/cloudflared/config.yml" ]; then
    echo "Configuration file:"
    cat /etc/cloudflared/config.yml
    echo ""
    
    # Check if app server matches
    if grep -q "http://${APP_SERVER}:${APP_PORT}" /etc/cloudflared/config.yml; then
        echo "✅ Config points to correct app server"
    else
        echo "❌ Config does NOT point to ${APP_SERVER}:${APP_PORT}"
    fi
else
    echo "❌ Configuration file not found"
fi

echo ""
echo ""

# 5. Check tunnel status
echo "5. Checking tunnel status..."
if ps aux | grep -v grep | grep -q "cloudflared.*tunnel"; then
    echo "✅ Tunnel process is running"
    ps aux | grep -v grep | grep cloudflared
else
    echo "❌ Tunnel process is NOT running"
fi

echo ""
echo ""

# 6. Test with tunnel running
echo "6. Testing ingress routing..."
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate 2>&1

