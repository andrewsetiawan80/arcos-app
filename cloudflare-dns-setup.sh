#!/bin/bash

# Cloudflare DNS Setup Script
# This script helps configure DNS records for the Cloudflare tunnel

TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
DOMAIN="cretewerkz.com"
TUNNEL_TARGET="${TUNNEL_ID}.cfargotunnel.com"

echo "🌐 Cloudflare DNS Setup for $DOMAIN"
echo "===================================="
echo "Tunnel ID: $TUNNEL_ID"
echo "Tunnel Target: $TUNNEL_TARGET"
echo ""

echo "📋 DNS Records to create in Cloudflare:"
echo ""
echo "1. Root domain (cretewerkz.com):"
echo "   Type: CNAME"
echo "   Name: @ (or leave blank)"
echo "   Target: $TUNNEL_TARGET"
echo "   Proxy: ✅ Proxied (orange cloud)"
echo ""
echo "2. WWW subdomain (www.cretewerkz.com):"
echo "   Type: CNAME"
echo "   Name: www"
echo "   Target: $TUNNEL_TARGET"
echo "   Proxy: ✅ Proxied (orange cloud)"
echo ""

echo "🔗 Quick link to Cloudflare DNS:"
echo "https://dash.cloudflare.com → Select domain → DNS → Records"
echo ""

# Try to use cloudflared CLI to configure DNS automatically
if command -v cloudflared &> /dev/null; then
    echo "🤖 Attempting automatic DNS configuration..."
    cloudflared tunnel route dns $TUNNEL_ID $DOMAIN 2>&1
    cloudflared tunnel route dns $TUNNEL_ID www.$DOMAIN 2>&1
    echo ""
    echo "✅ DNS records configured (if successful)"
else
    echo "⚠️  cloudflared CLI not found. Please configure DNS manually in Cloudflare dashboard."
fi

echo ""
echo "📝 Manual DNS Configuration Steps:"
echo "1. Go to https://dash.cloudflare.com"
echo "2. Select your domain: $DOMAIN"
echo "3. Go to DNS → Records"
echo "4. Click 'Add record'"
echo "5. Configure as shown above"
echo ""
echo "⏱️  DNS propagation usually takes 5-10 minutes"
echo ""


