# Fix Cloudflare Tunnel Error 1033

Error 1033 means the Cloudflare tunnel is not running or not properly connected.

## Quick Fix

**Run this on your connector machine (192.162.2.145):**

```bash
# Copy the setup script
scp complete-tunnel-setup.sh root@192.162.2.145:~/

# SSH into connector
ssh root@192.162.2.145

# Run the setup script
chmod +x complete-tunnel-setup.sh
./complete-tunnel-setup.sh
```

## What the Script Does

1. ✅ Installs cloudflared (if not installed)
2. ✅ Authenticates with Cloudflare (if needed)
3. ✅ Creates configuration file
4. ✅ Tests connectivity to app server
5. ✅ Validates tunnel configuration
6. ✅ Creates systemd service
7. ✅ Starts the tunnel
8. ✅ Verifies it's running

## Manual Fix Steps

If the script doesn't work, follow these steps manually:

### 1. Install cloudflared

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /tmp/cloudflared
chmod +x /tmp/cloudflared
sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
cloudflared --version
```

### 2. Authenticate

```bash
cloudflared tunnel login
```

This will:
- Open a browser window
- Ask you to log in to Cloudflare
- Download credentials file to `~/.cloudflared/`

### 3. Create Configuration

```bash
sudo mkdir -p /etc/cloudflared

sudo tee /etc/cloudflared/config.yml > /dev/null <<'EOF'
tunnel: mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9
credentials-file: /etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json

ingress:
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80
  - service: http_status:404
EOF
```

### 4. Copy Credentials

```bash
sudo cp ~/.cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json /etc/cloudflared/
sudo chmod 600 /etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json
```

### 5. Test Configuration

```bash
# Test connectivity to app server
curl http://192.168.2.189

# Validate tunnel config
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate

# Test tunnel manually (Ctrl+C to stop)
cloudflared tunnel --config /etc/cloudflared/config.yml run
```

### 6. Create Systemd Service

```bash
sudo tee /etc/systemd/system/cloudflared.service > /dev/null <<'EOF'
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### 7. Verify

```bash
# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f

# Test domain (wait 5-10 minutes after DNS setup)
curl https://cretewerkz.com
```

## Common Issues

### Issue: "Credentials file not found"
**Fix:** Run `cloudflared tunnel login` and copy credentials to `/etc/cloudflared/`

### Issue: "Cannot reach app server"
**Fix:** Verify app server is running: `curl http://192.168.2.189`

### Issue: "Tunnel won't start"
**Fix:** Check logs: `sudo journalctl -u cloudflared -n 50`

### Issue: "Invalid tunnel ID"
**Fix:** Verify tunnel ID matches Cloudflare dashboard

## Verification Checklist

- [ ] cloudflared is installed
- [ ] Credentials file exists at `/etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json`
- [ ] Configuration file exists at `/etc/cloudflared/config.yml`
- [ ] App server is reachable: `curl http://192.168.2.189`
- [ ] Tunnel service is running: `systemctl status cloudflared`
- [ ] No errors in logs: `journalctl -u cloudflared -n 50`

## After Fix

Once the tunnel is running:
1. Wait 1-2 minutes for connection to establish
2. Test: `curl https://cretewerkz.com`
3. Monitor logs: `sudo journalctl -u cloudflared -f`

Error 1033 should be resolved once the tunnel is running properly!


