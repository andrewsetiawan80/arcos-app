# Create Cloudflare DNS Records

## Quick Method: Using cloudflared CLI

If cloudflared is authenticated on the connector machine (192.168.2.145):

```bash
ssh root@192.168.2.145
cloudflared tunnel route dns mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9 cretewerkz.com
cloudflared tunnel route dns mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9 www.cretewerkz.com
```

## Method 2: Using Cloudflare API

1. Get your Cloudflare API token:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit zone DNS" template
   - Select zone: `cretewerkz.com`
   - Copy the token

2. Run the script:
   ```bash
   export CF_API_TOKEN='your-api-token-here'
   ./create-cloudflare-dns.sh
   ```

## Method 3: Manual Creation (Easiest)

1. Go to: **https://dash.cloudflare.com**
2. Select domain: **cretewerkz.com**
3. Go to: **DNS** → **Records**
4. Click **Add record**

### Record 1: Root Domain
- **Type**: `CNAME`
- **Name**: `@` (or leave blank)
- **Target**: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com`
- **Proxy status**: ✅ **Proxied** (orange cloud)
- Click **Save**

### Record 2: WWW Subdomain
- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com`
- **Proxy status**: ✅ **Proxied** (orange cloud)
- Click **Save**

## Verify DNS Records

After creating records, verify:

```bash
# Check DNS resolution
dig cretewerkz.com
nslookup cretewerkz.com

# Test HTTPS (after propagation, ~5-10 minutes)
curl -I https://cretewerkz.com
curl -I https://www.cretewerkz.com
```

## Troubleshooting

### Records Not Showing
- Refresh the Cloudflare dashboard
- Check you're in the correct zone (cretewerkz.com)
- Verify records are **Proxied** (not DNS-only)

### DNS Not Resolving
- Wait 5-10 minutes for propagation
- Verify target is exactly: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com`
- Check tunnel is running: `ssh root@192.168.2.145 "sudo systemctl status cloudflared"`

### 502 Bad Gateway
- Ensure tunnel is running and connected
- Check app server is accessible: `curl http://192.168.2.189`
- View tunnel logs: `ssh root@192.168.2.145 "sudo journalctl -u cloudflared -f"`


