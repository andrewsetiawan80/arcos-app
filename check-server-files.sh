#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking for arcos files/folders on server"
puts "=============================================="

set check_script "echo '=== Directories with arcos ===' && find /opt -maxdepth 2 -type d -name '*arcos*' -o -name '*Arcos*' 2>/dev/null && echo '' && echo '=== Service files ===' && ls -la /etc/systemd/system/*arcos* 2>/dev/null || echo 'No arcos service files' && echo '' && echo '=== Backend directory ===' && ls -la /opt/arcos-app/backend 2>/dev/null | head -5 || echo 'Old backend directory not found'"

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
