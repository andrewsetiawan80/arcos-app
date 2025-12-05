#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "📋 Checking backend logs"
puts "======================="

set log_script "journalctl -u arcos-backend.service -n 20 --no-pager"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $log_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
