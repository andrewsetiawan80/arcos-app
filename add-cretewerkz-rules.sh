#!/bin/bash

# Add cretewerkz.com ingress rules to tunnel config
# Run this on connector (192.162.2.145)

echo "🔧 Adding cretewerkz.com Rules to Tunnel Config"
echo "==============================================="
echo ""

CONFIG_FILE="/etc/cloudflared/config.yml"
BACKUP_FILE="/etc/cloudflared/config.yml.backup.$(date +%Y%m%d_%H%M%S)"

# Backup config
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# Check if cretewerkz.com rules already exist
if grep -q "hostname: cretewerkz.com" "$CONFIG_FILE"; then
    echo "⚠️  cretewerkz.com rules already exist"
    echo "Current config:"
    grep -A 3 "hostname: cretewerkz.com" "$CONFIG_FILE"
    echo ""
    read -p "Do you want to update them? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping..."
        exit 0
    fi
fi

# Create new config with cretewerkz.com rules added BEFORE catch-all
cat > "$CONFIG_FILE" <<'EOF'
tunnel: 65b25c90-4cdd-41b9-815b-f1e4a91b59cf
credentials-file: /root/.cloudflared/65b25c90-4cdd-41b9-815b-f1e4a91b59cf.json

ingress:
  # Cretewerkz.com - Arqon app
  - hostname: cretewerkz.com
    service: http://192.168.2.189:80
  
  - hostname: www.cretewerkz.com
    service: http://192.168.2.189:80

  # Root domain - Next.js app
  - hostname: kinexistech.com
    service: http://192.168.2.183:3000
    originRequest:
      httpHostHeader: kinexistech.com
      noHappyEyeballs: true

  # Public site - www.kinexistech.com -> Next.js app
  - hostname: www.kinexistech.com
    service: http://192.168.2.183:3000
    originRequest:
      httpHostHeader: www.kinexistech.com
      noHappyEyeballs: true

  # Business site - apps.kinexistech.com -> Next.js app
  - hostname: apps.kinexistech.com
    service: http://192.168.2.183:3000
    originRequest:
      httpHostHeader: apps.kinexistech.com
      noHappyEyeballs: true

  # Other services
  - hostname: dns.drivewerkz.com
    service: http://192.168.2.112:80
  - hostname: homeassistant.kinexistech.com
    service: http://192.168.2.181:8123
  - hostname: erpnext.kinexistech.com
    service: http://192.168.2.116:8000
    originRequest:
      noTLSVerify: true

  # Catch-all rule (MUST be last)
  - service: http_status:404
EOF

echo "✅ Configuration updated!"
echo ""
echo "New configuration:"
cat "$CONFIG_FILE"
echo ""

# Validate configuration
echo "Validating configuration..."
cloudflared tunnel --config "$CONFIG_FILE" ingress validate

echo ""
echo "✅ Configuration updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart tunnel:"
echo "   killall cloudflared"
echo "   cloudflared tunnel --config /etc/cloudflared/config.yml run"
echo ""
echo "2. Test: curl https://cretewerkz.com"


