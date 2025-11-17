#!/bin/bash

echo "🔍 Verifying Cloudflare Tunnel Connector Configuration"
echo "======================================================"
echo ""

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
APP_SERVER="192.168.2.189"
APP_PORT="80"
DOMAIN="cretewerkz.com"

# Check if config file exists
if [ -f "/etc/cloudflared/config.yml" ]; then
    echo "✅ Configuration file found at /etc/cloudflared/config.yml"
    echo ""
    echo "Current configuration:"
    echo "---------------------"
    cat /etc/cloudflared/config.yml
    echo ""
    echo "---------------------"
    echo ""
    
    # Verify tunnel ID
    if grep -q "tunnel: $TUNNEL_ID" /etc/cloudflared/config.yml; then
        echo "✅ Tunnel ID is correct: $TUNNEL_ID"
    else
        echo "❌ Tunnel ID mismatch in config file"
    fi
    
    # Verify credentials file path
    if grep -q "credentials-file: /etc/cloudflared/$TUNNEL_ID.json" /etc/cloudflared/config.yml; then
        echo "✅ Credentials file path is correct"
    else
        echo "⚠️  Credentials file path may be incorrect"
    fi
    
    # Verify ingress rules
    if grep -q "hostname: $DOMAIN" /etc/cloudflared/config.yml; then
        echo "✅ Root domain ingress rule found"
    else
        echo "❌ Root domain ingress rule missing"
    fi
    
    if grep -q "hostname: www.$DOMAIN" /etc/cloudflared/config.yml; then
        echo "✅ WWW subdomain ingress rule found"
    else
        echo "❌ WWW subdomain ingress rule missing"
    fi
    
    if grep -q "service: http://$APP_SERVER:$APP_PORT" /etc/cloudflared/config.yml; then
        echo "✅ App server target is correct: http://$APP_SERVER:$APP_PORT"
    else
        echo "❌ App server target is incorrect or missing"
    fi
    
    # Check for catch-all rule
    if grep -q "http_status:404" /etc/cloudflared/config.yml; then
        echo "✅ Catch-all rule found (required)"
    else
        echo "⚠️  Catch-all rule missing (should be last)"
    fi
    
else
    echo "❌ Configuration file not found at /etc/cloudflared/config.yml"
    echo ""
    echo "Expected configuration:"
    echo "---------------------"
    cat << CONFIGEOF
tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://$APP_SERVER:$APP_PORT
  
  - hostname: www.$DOMAIN
    service: http://$APP_SERVER:$APP_PORT
  
  - service: http_status:404
CONFIGEOF
    echo "---------------------"
fi

echo ""

# Check credentials file
if [ -f "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
    echo "✅ Credentials file exists: /etc/cloudflared/${TUNNEL_ID}.json"
    if [ -s "/etc/cloudflared/${TUNNEL_ID}.json" ]; then
        echo "✅ Credentials file is not empty"
    else
        echo "❌ Credentials file is empty"
    fi
else
    echo "❌ Credentials file not found: /etc/cloudflared/${TUNNEL_ID}.json"
    echo "   Run: cloudflared tunnel login"
fi

echo ""

# Test connectivity to app server
echo "🔍 Testing connectivity to app server..."
if curl -s --connect-timeout 5 "http://$APP_SERVER:$APP_PORT" > /dev/null 2>&1; then
    echo "✅ App server is reachable: http://$APP_SERVER:$APP_PORT"
else
    echo "❌ Cannot reach app server at http://$APP_SERVER:$APP_PORT"
    echo "   Check network connectivity and firewall rules"
fi

echo ""
echo "📋 Configuration Summary:"
echo "   Tunnel ID: $TUNNEL_ID"
echo "   Domain: $DOMAIN"
echo "   App Server: http://$APP_SERVER:$APP_PORT"
echo "   Connector: 192.168.2.145"
echo ""
