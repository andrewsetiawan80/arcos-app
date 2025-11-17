#!/bin/bash

# Verify Tunnel Configuration
# Run on connector

CORRECT_TUNNEL_ID="65b25c90-4cdd-41b9-815b-f1e4a91b59cf"
APP_SERVER="192.168.2.189"
APP_PORT="80"

echo "🔍 Verifying Tunnel Configuration"
echo "================================="
echo ""

# Check config file
if [ -f "/etc/cloudflared/config.yml" ]; then
    echo "Configuration file:"
    echo "-------------------"
    cat /etc/cloudflared/config.yml
    echo ""
    echo "-------------------"
    echo ""
    
    # Check tunnel ID
    if grep -q "tunnel: ${CORRECT_TUNNEL_ID}" /etc/cloudflared/config.yml; then
        echo "✅ Tunnel ID is correct"
    else
        echo "❌ Tunnel ID is WRONG!"
        echo "   Should be: ${CORRECT_TUNNEL_ID}"
        grep "tunnel:" /etc/cloudflared/config.yml
    fi
    
    # Check app server
    if grep -q "http://${APP_SERVER}:${APP_PORT}" /etc/cloudflared/config.yml; then
        echo "✅ App server is correct: http://${APP_SERVER}:${APP_PORT}"
    else
        echo "❌ App server is WRONG!"
        echo "   Should be: http://${APP_SERVER}:${APP_PORT}"
        grep "service:" /etc/cloudflared/config.yml
    fi
    
    # Check credentials file path
    if grep -q "credentials-file: /etc/cloudflared/${CORRECT_TUNNEL_ID}.json" /etc/cloudflared/config.yml; then
        echo "✅ Credentials file path is correct"
    else
        echo "⚠️  Credentials file path may be wrong"
        grep "credentials-file:" /etc/cloudflared/config.yml
    fi
    
else
    echo "❌ Configuration file not found!"
fi

echo ""

# Test app server connectivity
echo "Testing app server connectivity..."
if curl -s --connect-timeout 5 "http://${APP_SERVER}:${APP_PORT}" > /dev/null 2>&1; then
    echo "✅ Connector CAN reach app server"
    echo ""
    echo "Response:"
    curl -s "http://${APP_SERVER}:${APP_PORT}" | head -10
else
    echo "❌ Connector CANNOT reach app server!"
    echo "   Check network connectivity and firewall"
fi

echo ""
echo ""

# Validate ingress
echo "Validating ingress rules..."
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate

