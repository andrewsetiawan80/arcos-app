#!/bin/bash

# Cloudflare DNS Record Creation Script
# This script creates DNS records using Cloudflare API

set -e

# Configuration
ZONE_NAME="cretewerkz.com"
TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"
TARGET="${TUNNEL_ID}.cfargotunnel.com"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🌐 Cloudflare DNS Record Creation"
echo "=================================="
echo "Zone: $ZONE_NAME"
echo "Target: $TARGET"
echo ""

# Check if API token is provided
if [ -z "$CF_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Cloudflare API Token not found${NC}"
    echo ""
    echo "To create DNS records automatically, you need a Cloudflare API token."
    echo ""
    echo "Option 1: Use cloudflared CLI (if authenticated on connector):"
    echo "  ssh root@192.168.2.145"
    echo "  cloudflared tunnel route dns $TUNNEL_ID cretewerkz.com"
    echo "  cloudflared tunnel route dns $TUNNEL_ID www.cretewerkz.com"
    echo ""
    echo "Option 2: Use Cloudflare API (requires API token):"
    echo "  export CF_API_TOKEN='your-api-token'"
    echo "  ./create-cloudflare-dns.sh"
    echo ""
    echo "Option 3: Manual creation in Cloudflare Dashboard:"
    echo "  https://dash.cloudflare.com → DNS → Records"
    echo "  Add CNAME: @ → $TARGET (Proxied)"
    echo "  Add CNAME: www → $TARGET (Proxied)"
    echo ""
    exit 1
fi

echo -e "${GREEN}Using Cloudflare API to create DNS records...${NC}"
echo ""

# Get Zone ID
echo "📡 Fetching Zone ID..."
ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${ZONE_NAME}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json")

ZONE_ID=$(echo $ZONE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ZONE_ID" ]; then
    echo -e "${RED}❌ Failed to get Zone ID. Check your API token and zone name.${NC}"
    echo "Response: $ZONE_RESPONSE"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# Create root domain CNAME
echo "📝 Creating CNAME record for @ (root domain)..."
ROOT_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"@\",\"content\":\"${TARGET}\",\"proxied\":true}")

if echo $ROOT_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Root domain (@) CNAME record created${NC}"
else
    echo -e "${RED}❌ Failed to create root domain record${NC}"
    echo "Response: $ROOT_RESPONSE"
fi

echo ""

# Create www subdomain CNAME
echo "📝 Creating CNAME record for www..."
WWW_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"${TARGET}\",\"proxied\":true}")

if echo $WWW_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ WWW subdomain CNAME record created${NC}"
else
    echo -e "${RED}❌ Failed to create www record${NC}"
    echo "Response: $WWW_RESPONSE"
fi

echo ""
echo -e "${GREEN}✅ DNS records creation complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   Zone: $ZONE_NAME"
echo "   Records created:"
echo "   - @ → $TARGET (Proxied)"
echo "   - www → $TARGET (Proxied)"
echo ""
echo "⏱️  DNS propagation usually takes 5-10 minutes"
echo "   Test with: curl https://cretewerkz.com"
echo ""


