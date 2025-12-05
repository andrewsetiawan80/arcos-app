#!/usr/bin/expect -f

set timeout 180
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing backend build"
puts "======================"

set fix_script "cd /opt/arcos-app/backend && npm install typescript --save-dev && npm run build && systemctl restart arcos-backend.service && sleep 2 && systemctl status arcos-backend.service --no-pager | head -5"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $fix_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
