#!/bin/bash

# Check Connector at 192.162.2.145
CONNECTOR_IP="192.162.2.145"
TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
APP_SERVER="192.168.2.189"

echo "🔍 Checking Connector at $CONNECTOR_IP"
echo "======================================"
echo ""

# Test connectivity
echo "1. Testing connectivity to connector..."
if ping -c 2 -W 2 $CONNECTOR_IP > /dev/null 2>&1; then
    echo "✅ Connector is reachable"
else
    echo "⚠️  Cannot ping connector"
fi

echo ""

# Check cloudflared
echo "2. Checking cloudflared..."
ssh root@$CONNECTOR_IP "which cloudflared && cloudflared --version | head -1" 2>/dev/null || echo "❌ cloudflared not found or SSH failed"

echo ""

# Check service status
echo "3. Checking tunnel service..."
ssh root@$CONNECTOR_IP "systemctl status cloudflared --no-pager -l | head -15" 2>/dev/null || echo "❌ Cannot check service status"

echo ""

# Check configuration
echo "4. Checking configuration file..."
ssh root@$CONNECTOR_IP "cat /etc/cloudflared/config.yml" 2>/dev/null || echo "❌ Configuration file not found"

echo ""

# Check credentials
echo "5. Checking credentials file..."
ssh root@$CONNECTOR_IP "ls -la /etc/cloudflared/${TUNNEL_ID}.json" 2>/dev/null || echo "❌ Credentials file not found"

echo ""

# Test app server connectivity from connector
echo "6. Testing app server connectivity from connector..."
ssh root@$CONNECTOR_IP "curl -s --connect-timeout 5 http://$APP_SERVER | head -5" 2>/dev/null || echo "❌ Cannot reach app server from connector"

echo ""
echo "✅ Check complete"


