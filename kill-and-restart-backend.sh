#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Killing old process and restarting"
puts "======================================"

set restart_script "pkill -f 'node.*dist/index.js' || true && sleep 2 && systemctl restart arcos-backend.service && sleep 3 && systemctl status arcos-backend.service --no-pager | head -5"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $restart_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
