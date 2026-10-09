#!/bin/bash
# Deploy updated database config to Arcos app server so it uses the new PostgreSQL at 192.168.2.111
# App server: 192.168.2.189

set -e

APP_HOST="${1:-root@192.168.2.189}"
REMOTE_DIR="/opt/arcos-app"
DB_HOST="192.168.2.111"

echo "=========================================="
echo "  Deploy DB config to Arcos app server"
echo "=========================================="
echo "  App server:  $APP_HOST"
echo "  DB host:     $DB_HOST"
echo "=========================================="

# 1. Copy updated docker-compose.yml (with DATABASE_URL pointing to 192.168.2.111)
echo ""
echo "[1/3] Copying docker-compose.yml to app server..."
scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 docker-compose.yml "$APP_HOST:$REMOTE_DIR/"
echo "  Done."

# 2. Update .env.production on server so DATABASE_URL uses new DB host (for systemd or env override)
echo ""
echo "[2/3] Updating DATABASE_URL on server to use $DB_HOST..."
ssh -o StrictHostKeyChecking=no "$APP_HOST" 'cd /opt/arcos-app && \
  if [ -f .env.production ]; then \
    sed -i.bak "s|@[0-9][0-9.]*:5432/|@192.168.2.111:5432/|g" .env.production 2>/dev/null || true; \
    echo "  .env.production updated (DB host -> 192.168.2.111)"; \
  else \
    echo "  No .env.production on server (Docker Compose will use its own DATABASE_URL)"; \
  fi'

# 3. Restart backend so it picks up new DB URL
echo ""
echo "[3/3] Restarting backend..."
ssh -o StrictHostKeyChecking=no "$APP_HOST" "cd $REMOTE_DIR && \
  if docker compose ps -q backend 2>/dev/null | head -1 | grep -q .; then \
    echo '  Restarting Docker backend container...'; \
    docker compose up -d --force-recreate backend; \
    echo '  Backend container recreated.'; \
  elif systemctl is-active --quiet arcos-backend.service 2>/dev/null; then \
    echo '  Restarting systemd arcos-backend.service...'; \
    systemctl restart arcos-backend.service; \
    echo '  Backend service restarted.'; \
  else \
    echo '  Could not detect backend (Docker or systemd). Please restart manually on the server.'; \
    exit 1; \
  fi"

echo ""
echo "=========================================="
echo "  Done. Arcos app should now use DB at $DB_HOST"
echo "=========================================="
echo "  Check: curl -s http://${APP_HOST#*@}:3001/api/health"
echo ""
