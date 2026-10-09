#!/bin/bash

# Seed demo product on production server

set -e

REMOTE_HOST="192.168.2.189"
REMOTE_USER="root"
REMOTE_PASS="Andrewis0380"
REMOTE_PATH="/opt/arcos-app"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌱 Seeding demo product on production${NC}"
echo "===================================="

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}📦 Installing sshpass...${NC}"
    brew install hudochenkov/sshpass/sshpass
fi

# Copy seed file to server
echo -e "${YELLOW}📤 Uploading seed script...${NC}"
sshpass -p "$REMOTE_PASS" scp -o StrictHostKeyChecking=no \
    backend/src/db/seedDemoProduct.ts \
    $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend/src/db/

# Run seed on production
echo -e "${YELLOW}🌱 Running seed on production database...${NC}"
sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST << 'EOF'
cd /opt/arcos-app
docker compose exec backend npx tsx src/db/seedDemoProduct.ts
EOF

echo -e "${GREEN}✅ Demo product seeded successfully!${NC}"
echo ""
echo -e "${GREEN}🎉 Try it now at: http://192.168.2.189${NC}"
echo -e "   Product URL: ${BLUE}http://192.168.2.189/product/demo-relief-panel${NC}"
