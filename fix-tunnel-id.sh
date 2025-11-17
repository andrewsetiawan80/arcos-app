#!/bin/bash

# Fix Tunnel ID Mismatch
# Run this on the connector machine (192.162.2.145)

CORRECT_TUNNEL_ID="65b25c90-4cdd-41b9-815b-f1e4a91b59cf"
OLD_TUNNEL_ID="mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9"

echo "🔧 Fixing Tunnel ID Configuration"
echo "================================="
echo ""
echo "Correct Tunnel ID: $CORRECT_TUNNEL_ID"
echo "Old Tunnel ID (wrong): $OLD_TUNNEL_ID"
echo ""

# 1. Update configuration file
echo "1. Updating configuration file..."
if [ -f "/etc/cloudflared/config.yml" ]; then
    # Backup original
    cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.backup
    
    # Update tunnel ID
    sed -i "s/tunnel: ${OLD_TUNNEL_ID}/tunnel: ${CORRECT_TUNNEL_ID}/g" /etc/cloudflared/config.yml
    sed -i "s/${OLD_TUNNEL_ID}\.json/${CORRECT_TUNNEL_ID}.json/g" /etc/cloudflared/config.yml
    
    echo "✅ Configuration updated"
    echo ""
    echo "New configuration:"
    cat /etc/cloudflared/config.yml
else
    echo "❌ Configuration file not found"
    exit 1
fi

echo ""

# 2. Check/rename credentials file
echo "2. Checking credentials file..."
if [ -f "/etc/cloudflared/${OLD_TUNNEL_ID}.json" ]; then
    echo "Found old credentials file, renaming..."
    mv /etc/cloudflared/${OLD_TUNNEL_ID}.json /etc/cloudflared/${CORRECT_TUNNEL_ID}.json
    echo "✅ Credentials file renamed"
elif [ -f "/etc/cloudflared/${CORRECT_TUNNEL_ID}.json" ]; then
    echo "✅ Correct credentials file already exists"
else
    echo "⚠️  Credentials file not found"
    echo "   Expected: /etc/cloudflared/${CORRECT_TUNNEL_ID}.json"
    echo "   Run: cloudflared tunnel login"
fi

echo ""

# 3. Validate configuration
echo "3. Validating configuration..."
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate

echo ""

# 4. Restart tunnel
echo "4. Restarting tunnel..."
killall cloudflared 2>/dev/null || true
sleep 2

echo "Starting tunnel..."
cloudflared tunnel --config /etc/cloudflared/config.yml run > /tmp/cloudflared.log 2>&1 &
TUNNEL_PID=$!

sleep 5

if ps -p $TUNNEL_PID > /dev/null; then
    echo "✅ Tunnel started (PID: $TUNNEL_PID)"
    echo ""
    echo "Recent logs:"
    tail -20 /tmp/cloudflared.log
else
    echo "❌ Tunnel failed to start"
    echo "Check logs: cat /tmp/cloudflared.log"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "Test: curl https://cretewerkz.com"


