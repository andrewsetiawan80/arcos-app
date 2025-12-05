#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Redeploying backend with public endpoints..."

puts "📤 Uploading backend files..."
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r backend/src/routes/data.ts backend/src/db/client.ts docker-compose.yml $REMOTE_USER@$REMOTE_HOST:/tmp/
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts "🚀 Copying files and rebuilding backend..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "cd /opt/arcos-app && cp /tmp/data.ts backend/src/routes/ && cp /tmp/client.ts backend/src/db/ && cp /tmp/docker-compose.yml . && docker compose build backend && docker compose up -d backend && sleep 10 && docker compose logs backend --tail 10"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Backend redeployed. Testing public endpoints..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "sleep 3 && curl -s http://localhost/api/data/public/products | head -c 200 && echo ''"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Done!"


