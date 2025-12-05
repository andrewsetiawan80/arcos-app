#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking for remaining arcos references on server"
puts "==================================================="

set check_script "echo '=== Service files ===' && ls -la /etc/systemd/system/*arcos* 2>/dev/null || echo 'No arcos service files' && echo '' && echo '=== Directories ===' && find /opt -maxdepth 1 -type d -name '*arcos*' -o -name '*cretewerkz*' 2>/dev/null && echo '' && echo '=== Backend service path ===' && grep 'WorkingDirectory' /etc/systemd/system/arcos-backend.service"

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
