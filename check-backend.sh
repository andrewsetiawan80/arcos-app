#!/usr/bin/expect -f

set timeout 30
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking backend status..."

spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "cd /opt/arcos-app && docker compose ps && echo '' && echo 'Testing backend directly:' && docker exec arcos-backend curl -s http://localhost:3001/health && echo '' && echo 'Testing backend from nginx:' && docker exec arcos-frontend curl -s http://backend:3001/health"
expect "password:"
send "$REMOTE_PASS\r"
expect eof


