# Quick Cloudflare Zero Trust Setup

Quick guide to set up Cloudflare Zero Trust tunnel for cretewerkz.com.

## Prerequisites

- Cloudflare account with Zero Trust enabled
- Domain `cretewerkz.com` added to Cloudflare
- SSH access to connector machine (192.168.2.145)
- Network connectivity between 192.168.2.145 and 192.168.2.189

## Quick Setup (5 minutes)

### 1. Create Tunnel in Cloudflare Dashboard

1. Go to https://one.dash.cloudflare.com/
2. Navigate to **Networks** → **Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared**
5. Name it: `cretewerkz-tunnel`
6. Copy the **Tunnel ID** (you'll need it)

### 2. Run Setup Script on Connector Machine

```bash
# Copy files to connector machine
scp setup-cloudflare-tunnel.sh cloudflared-config.yml root@192.168.2.145:~/

# SSH into connector machine
ssh root@192.168.2.145

# Authenticate cloudflared (first time only)
cloudflared tunnel login

# Run setup script (replace YOUR_TUNNEL_ID with actual tunnel ID)
./setup-cloudflare-tunnel.sh YOUR_TUNNEL_ID
```

### 3. Configure DNS in Cloudflare

1. Go to Cloudflare Dashboard → **DNS** → **Records**
2. Add CNAME record:
   - **Name**: `@` (or leave blank)
   - **Target**: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - **Proxy**: ✅ Proxied (orange cloud)
3. Add CNAME record for www:
   - **Name**: `www`
   - **Target**: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - **Proxy**: ✅ Proxied (orange cloud)

### 4. Verify

```bash
# Check tunnel status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f

# Test domain
curl https://cretewerkz.com
```

## Manual Setup (Alternative)

If you prefer manual setup, see `CLOUDFLARE_SETUP.md` for detailed instructions.

## Troubleshooting

### Tunnel won't start
```bash
# Check logs
sudo journalctl -u cloudflared -n 50

# Verify config
cat /etc/cloudflared/config.yml

# Test connectivity
curl http://192.168.2.189
```

### DNS not working
- Verify DNS records are proxied (orange cloud)
- Wait 5-10 minutes for DNS propagation
- Check tunnel status in Cloudflare dashboard

### 502 Bad Gateway
- Verify app is running: `curl http://192.168.2.189`
- Check firewall allows traffic from 192.168.2.145 to 192.168.2.189
- Check Nginx logs on app server

## Next Steps

1. **Enable SSL/TLS**: Cloudflare provides SSL automatically, but you can enable "Full" or "Full (strict)" mode in SSL/TLS settings
2. **Configure Access Policies**: Set up Zero Trust Access policies to restrict who can access the application
3. **Set up Monitoring**: Monitor tunnel health in Cloudflare dashboard

## Files Created

- `cloudflared-config.yml` - Tunnel configuration template
- `setup-cloudflare-tunnel.sh` - Automated setup script
- `CLOUDFLARE_SETUP.md` - Detailed setup guide


