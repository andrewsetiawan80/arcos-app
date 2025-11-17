#!/bin/bash

# Keep Cloudflare Tunnel Running
# Run this on the connector to ensure tunnel stays running

echo "🔄 Ensuring Cloudflare Tunnel Stays Running"
echo "==========================================="
echo ""

# Check if tunnel is running
if ps aux | grep -v grep | grep -q "cloudflared.*tunnel"; then
    echo "✅ Tunnel is already running"
    ps aux | grep -v grep | grep cloudflared
else
    echo "⚠️  Tunnel is not running"
    echo "Starting tunnel..."
    
    # Start in background
    nohup cloudflared tunnel --config /etc/cloudflared/config.yml run > /tmp/cloudflared.log 2>&1 &
    
    sleep 3
    
    if ps aux | grep -v grep | grep -q "cloudflared.*tunnel"; then
        echo "✅ Tunnel started successfully"
    else
        echo "❌ Failed to start tunnel"
        echo "Check logs: cat /tmp/cloudflared.log"
        exit 1
    fi
fi

echo ""
echo "📋 Tunnel Status:"
ps aux | grep -v grep | grep cloudflared

echo ""
echo "📝 To keep tunnel running after reboot:"
echo "   1. Add to /etc/rc.local"
echo "   2. Use systemd service (if sudo works)"
echo "   3. Use cron @reboot"
echo ""
echo "Current process will run until:"
echo "   - Server reboots"
echo "   - Process is killed"
echo "   - SSH session closes (if not using nohup)"
echo ""


