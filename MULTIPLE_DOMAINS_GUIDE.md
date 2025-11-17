# Cloudflare Tunnel - Multiple Domains Guide

## Can One Connector Handle Multiple Domains?

**YES!** A single Cloudflare tunnel connector can handle **unlimited domains**. You configure this through ingress rules in the tunnel configuration.

## How It Works

Each tunnel can have multiple ingress rules that route different domains to different services:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /etc/cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Domain 1
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80
  
  # Domain 2
  - hostname: anotherdomain.com
    service: http://192.168.2.190:80
  
  - hostname: www.anotherdomain.com
    service: http://192.168.2.190:80
  
  # Domain 3 - different service
  - hostname: api.example.com
    service: http://192.168.2.191:3001
  
  # Catch-all (MUST be last)
  - service: http_status:404
```

## Important Rules

1. **Ingress rules are evaluated top to bottom**
   - First matching rule wins
   - More specific rules should come first

2. **Catch-all rule MUST be last**
   - `service: http_status:404` must be the final rule
   - This handles any unmatched requests

3. **Each domain needs DNS records**
   - Each domain must have CNAME records pointing to your tunnel
   - Example: `anotherdomain.com` → `YOUR_TUNNEL_ID.cfargotunnel.com`

## Current Configuration

Your current config handles:
- ✅ `cretewerkz.com` → `192.168.2.189:80`
- ✅ `www.cretewerkz.com` → `192.168.2.189:80`
- ✅ Catch-all → 404

## Adding More Domains

To add more domains:

1. **Add ingress rules** to `/etc/cloudflared/config.yml`:

```yaml
ingress:
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80
  
  # Add new domain
  - hostname: newdomain.com
    service: http://192.168.2.189:80
  - hostname: www.newdomain.com
    service: http://192.168.2.189:80
  
  - service: http_status:404
```

2. **Create DNS records** in Cloudflare for each domain:
   - `newdomain.com` → `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com` (Proxied)
   - `www.newdomain.com` → `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.cfargotunnel.com` (Proxied)

3. **Restart tunnel**:
```bash
sudo systemctl restart cloudflared
```

## Examples

### Example 1: Multiple Domains, Same Server
```yaml
ingress:
  - hostname: site1.com
    service: http://192.168.2.189:80
  - hostname: site2.com
    service: http://192.168.2.189:80
  - hostname: site3.com
    service: http://192.168.2.189:80
  - service: http_status:404
```

### Example 2: Multiple Domains, Different Servers
```yaml
ingress:
  - hostname: frontend.com
    service: http://192.168.2.189:80
  - hostname: api.backend.com
    service: http://192.168.2.190:3001
  - hostname: admin.management.com
    service: http://192.168.2.191:8080
  - service: http_status:404
```

### Example 3: Subdomains to Different Services
```yaml
ingress:
  - hostname: api.example.com
    service: http://192.168.2.189:3001
  - hostname: admin.example.com
    service: http://192.168.2.189:8080
  - hostname: example.com
    service: http://192.168.2.189:80
  - hostname: www.example.com
    service: http://192.168.2.189:80
  - service: http_status:404
```

## Performance

- **No performance impact** - One connector handles all domains efficiently
- **Same tunnel** - All domains use the same tunnel connection
- **Scalable** - Add as many domains as needed

## Error 1033 Still Happening?

Error 1033 means the tunnel isn't running. This is **NOT** related to multiple domains.

**Fix:**
1. Ensure tunnel service is running: `sudo systemctl start cloudflared`
2. Check status: `sudo systemctl status cloudflared`
3. View logs: `sudo journalctl -u cloudflared -f`

The tunnel can handle multiple domains once it's running properly!


