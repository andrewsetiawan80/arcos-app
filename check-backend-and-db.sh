#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking backend and database"
puts "================================"

set check_script "echo '1. Backend status:' && systemctl status arcos-backend.service --no-pager | head -3 && echo '' && echo '2. Backend logs (seeding):' && journalctl -u arcos-backend.service --since '5 minutes ago' | grep -i 'seed\|webp\|inspiration' | tail -5 && echo '' && echo '3. Testing API endpoint:' && curl -s http://localhost:3001/api/inspiration/images?limit=3 2>/dev/null | head -20 || echo 'API not responding'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $check_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
