#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing backend database connection and restarting..."

puts "📤 Uploading updated files..."
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null docker-compose.yml backend/src/db/client.ts $REMOTE_USER@$REMOTE_HOST:/tmp/
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts "🚀 Restarting backend with fixed database connection..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "cd /opt/cretewerkz-app && cp /tmp/docker-compose.yml . && cp /tmp/client.ts backend/src/db/ && docker compose restart backend && sleep 10 && docker compose logs backend --tail 10"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Backend restarted. Check logs above for connection status."


