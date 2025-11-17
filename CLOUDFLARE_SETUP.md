# Cloudflare Zero Trust Tunnel Setup Guide

This guide explains how to set up Cloudflare Zero Trust to route `cretewerkz.com` to your internal server at `192.168.2.189` using the cloudflared connector at `192.168.2.145`.

## Prerequisites

1. Cloudflare account with Zero Trust enabled
2. Domain `cretewerkz.com` added to Cloudflare
3. Access to the cloudflared connector machine (192.168.2.145)
4. Network connectivity between 192.168.2.145 and 192.168.2.189

## Step 1: Create Tunnel in Cloudflare Dashboard

1. Log in to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Go to **Networks** → **Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared** as the connector type
5. Give your tunnel a name (e.g., `cretewerkz-tunnel`)
6. Click **Save tunnel**

## Step 2: Install Cloudflared on Connector Machine

SSH into the connector machine (192.168.2.145):

```bash
ssh root@192.168.2.145
```

Install cloudflared:

```bash
# For Debian/Ubuntu
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# For CentOS/RHEL
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm
sudo rpm -i cloudflared-linux-amd64.rpm

# Or use the official repository
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

## Step 3: Authenticate Cloudflared

On the connector machine (192.168.2.145):

```bash
cloudflared tunnel login
```

This will open a browser window for authentication. Log in with your Cloudflare account.

## Step 4: Create Tunnel Configuration

On the connector machine (192.168.2.145), create the config directory:

```bash
sudo mkdir -p /etc/cloudflared
```

Copy the configuration file:

```bash
# Copy cloudflared-config.yml from your local machine
scp cloudflared-config.yml root@192.168.2.145:/etc/cloudflared/config.yml
```

Or create it manually:

```bash
sudo nano /etc/cloudflared/config.yml
```

Paste the following (replace `YOUR_TUNNEL_ID` with your actual tunnel ID from Step 1):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /etc/cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80
  
  - service: http_status:404
```

## Step 5: Run Cloudflared Connector

### Option A: Run as Systemd Service (Recommended)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Add the following:

```ini
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
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

### Option B: Run Manually

```bash
cloudflared tunnel --config /etc/cloudflared/config.yml run
```

## Step 6: Configure DNS in Cloudflare

1. Go to Cloudflare Dashboard → **DNS** → **Records**
2. For `cretewerkz.com`:
   - Type: `CNAME`
   - Name: `@` (or leave blank)
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)
3. For `www.cretewerkz.com`:
   - Type: `CNAME`
   - Name: `www`
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)

## Step 7: Verify Setup

1. Check tunnel status:
   ```bash
   sudo systemctl status cloudflared
   ```

2. Check tunnel logs:
   ```bash
   sudo journalctl -u cloudflared -f
   ```

3. Test connectivity:
   ```bash
   # From connector machine, test internal connection
   curl http://192.168.2.189
   
   # From external network, test public domain
   curl https://cretewerkz.com
   ```

## Step 8: Configure Application for HTTPS

Since Cloudflare provides HTTPS termination, ensure your application:

1. **Accepts proxy headers** (if needed):
   - Update Nginx config to trust Cloudflare IPs
   - Add Cloudflare IP ranges to trusted proxies

2. **Update CORS settings** (if needed):
   - Allow `https://cretewerkz.com` in CORS origins

## Troubleshooting

### Tunnel Not Connecting

```bash
# Check tunnel status
cloudflared tunnel info

# Check logs
sudo journalctl -u cloudflared -n 50

# Test connectivity
ping 192.168.2.189
curl http://192.168.2.189
```

### DNS Not Resolving

- Verify DNS records are set correctly in Cloudflare
- Check that records are proxied (orange cloud)
- Wait for DNS propagation (can take up to 24 hours, usually < 5 minutes)

### 502 Bad Gateway

- Verify the app is running on 192.168.2.189:80
- Check firewall rules allow traffic from 192.168.2.145 to 192.168.2.189
- Check Nginx logs on the app server

### Connection Refused

- Ensure port 80 is open on 192.168.2.189
- Check if the app is listening on the correct interface (0.0.0.0, not 127.0.0.1)

## Security Notes

1. **Firewall**: Only allow necessary ports between connector and app server
2. **SSL/TLS**: Cloudflare provides SSL termination, but you can also enable SSL on the internal server
3. **Access Control**: Use Cloudflare Zero Trust Access policies to restrict who can access the application
4. **Rate Limiting**: Configure rate limiting in Cloudflare dashboard

## Updating Configuration

After making changes to `/etc/cloudflared/config.yml`:

```bash
sudo systemctl restart cloudflared
```

## Monitoring

View tunnel metrics in Cloudflare Zero Trust Dashboard:
- Go to **Networks** → **Tunnels** → Select your tunnel
- View connection status, bandwidth, and error rates

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
- [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)


