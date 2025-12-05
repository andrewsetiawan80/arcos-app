#!/usr/bin/expect -f

set timeout 30
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Debugging backend connection..."

spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "cd /opt/arcos-app && echo '=== Backend Logs (last 20 lines) ===' && docker compose logs backend --tail 20 && echo '' && echo '=== Backend Status ===' && docker compose ps backend && echo '' && echo '=== Testing from frontend container ===' && docker exec arcos-frontend wget -qO- http://backend:3001/health 2>&1 || echo 'wget failed'"
expect "password:"
send "$REMOTE_PASS\r"
expect eof


