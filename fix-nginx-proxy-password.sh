#!/usr/bin/expect -f

set timeout 30
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing Nginx proxy configuration..."

puts "📤 Uploading updated nginx.conf..."
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null nginx.conf $REMOTE_USER@$REMOTE_HOST:/opt/cretewerkz-app/nginx.conf
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts "🚀 Restarting frontend container..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "cd /opt/cretewerkz-app && docker compose restart frontend && sleep 3 && docker compose ps frontend"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Done! Testing API endpoint..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "curl -s http://localhost/api/health"
expect "password:"
send "$REMOTE_PASS\r"
expect eof

puts ""
puts "✅ Done! Try accessing http://192.168.2.189/api/health now"
