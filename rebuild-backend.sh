#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Rebuilding backend with fixed database connection..."

puts "📤 Uploading updated files..."
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r docker-compose.yml backend/src/db/client.ts $REMOTE_USER@$REMOTE_HOST:/tmp/
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts "🚀 Copying files and rebuilding backend..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "cd /opt/cretewerkz-app && cp /tmp/docker-compose.yml . && cp /tmp/client.ts backend/src/db/ && docker compose build backend && docker compose up -d backend && sleep 15 && docker compose logs backend --tail 15"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Backend rebuilt. Testing API..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "sleep 5 && curl -s http://localhost/api/health"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Done! Backend should now be accessible."


