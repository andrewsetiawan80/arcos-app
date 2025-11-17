# Cloudflare DNS Configuration Instructions

## Quick Setup

Your tunnel ID: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9`

## DNS Records to Create

Go to: **https://dash.cloudflare.com** → Select domain `cretewerkz.com` → **DNS** → **Records**

### Record 1: Root Domain
- **Type**: `CNAME`
- **Name**: `@` (or leave blank)
- **Target**: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com`
- **Proxy status**: ✅ **Proxied** (orange cloud)
- **TTL**: Auto

### Record 2: WWW Subdomain
- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com`
- **Proxy status**: ✅ **Proxied** (orange cloud)
- **TTL**: Auto

## Automated DNS Setup (Alternative)

If you have cloudflared CLI installed and authenticated on the connector machine:

```bash
ssh root@192.168.2.145
cloudflared tunnel route dns mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9 cretewerkz.com
cloudflared tunnel route dns mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9 www.cretewerkz.com
```

## Verification

After DNS records are created:

1. **Wait 5-10 minutes** for DNS propagation
2. **Test the domain**:
   ```bash
   curl https://cretewerkz.com
   curl https://www.cretewerkz.com
   ```
3. **Check DNS propagation**:
   ```bash
   dig cretewerkz.com
   nslookup cretewerkz.com
   ```

## Troubleshooting

### DNS Not Resolving
- Verify records are **Proxied** (orange cloud), not DNS-only (grey cloud)
- Check that target is exactly: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com`
- Wait longer for propagation (can take up to 24 hours, usually < 10 minutes)

### 502 Bad Gateway
- Verify tunnel is running: `ssh root@192.168.2.145 "sudo systemctl status cloudflared"`
- Check app server is accessible: `curl http://192.168.2.189`
- View tunnel logs: `ssh root@192.168.2.145 "sudo journalctl -u cloudflared -f"`

### SSL/TLS Issues
- Cloudflare provides SSL automatically
- Ensure SSL/TLS mode is set to "Full" or "Full (strict)" in Cloudflare Dashboard → SSL/TLS


