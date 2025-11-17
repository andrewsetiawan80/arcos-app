# Cloudflare Tunnel Connector Configuration Verification

## Expected Configuration

**File:** `/etc/cloudflared/config.yml` (on connector machine 192.168.2.145)

```yaml
tunnel: mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9
credentials-file: /etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json

ingress:
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80
  
  - service: http_status:404
```

## Configuration Checklist

✅ **Tunnel ID**: `mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9`
- Must match the tunnel ID from Cloudflare dashboard

✅ **Credentials File**: `/etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json`
- Must exist and contain valid tunnel credentials
- Obtained via: `cloudflared tunnel login`

✅ **Ingress Rules**:
1. **Root domain**: `cretewerkz.com` → `http://192.168.2.189:80`
2. **WWW subdomain**: `www.cretewerkz.com` → `http://192.168.2.189:80`
3. **Catch-all**: `http_status:404` (must be last)

✅ **App Server**: `192.168.2.189:80`
- Must be accessible from connector (192.168.2.145)
- Must be running and responding to HTTP requests

## Verification Steps

### 1. Check Configuration File

```bash
ssh root@192.168.2.145
cat /etc/cloudflared/config.yml
```

**Should show:**
- Correct tunnel ID
- Correct credentials file path
- All ingress rules in correct order
- Catch-all rule as last entry

### 2. Check Credentials File

```bash
ls -la /etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json
```

**Should exist and be readable**

### 3. Test App Server Connectivity

```bash
curl http://192.168.2.189
```

**Should return:** HTTP response from your app (not connection refused)

### 4. Verify Tunnel Status

```bash
sudo systemctl status cloudflared
```

**Should show:** Active (running)

### 5. Check Tunnel Logs

```bash
sudo journalctl -u cloudflared -n 50
```

**Should show:**
- No authentication errors
- Connection established messages
- No ingress rule errors

## Common Configuration Issues

### ❌ Wrong Tunnel ID
**Symptom:** Authentication fails, tunnel won't start
**Fix:** Verify tunnel ID matches Cloudflare dashboard

### ❌ Missing Credentials File
**Symptom:** Error about credentials file not found
**Fix:** Run `cloudflared tunnel login`

### ❌ Incorrect Ingress Order
**Symptom:** Some routes work, others don't
**Fix:** Ensure catch-all rule (`http_status:404`) is last

### ❌ App Server Not Accessible
**Symptom:** 502 Bad Gateway errors
**Fix:** Verify app server is running and accessible from connector

### ❌ Wrong Service URL
**Symptom:** Connection refused errors
**Fix:** Verify app server IP and port are correct

## Quick Verification Script

Run on connector machine:

```bash
./verify-connector-config.sh
```

This will check:
- Configuration file exists and is correct
- Credentials file exists
- App server is reachable
- All ingress rules are present

## Correct Configuration Example

```yaml
tunnel: mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9
credentials-file: /etc/cloudflared/mFf0pCSQhC98LL3CevNFRD2HWqqPelKrkIKX2tE9.json

ingress:
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80
  
  - service: http_status:404
```

**Important Notes:**
- Ingress rules are evaluated **top to bottom**
- First matching rule is used
- Catch-all rule (`http_status:404`) **must be last**
- Hostname matching is case-insensitive
- Service URLs must be accessible from connector


