#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Checking old directory on server"
puts "===================================="

set check_script "echo '=== Old directory status ===' && ls -la /opt/arcos-app 2>/dev/null | head -5 && echo '' && echo '=== Current backend location ===' && ls -la /opt/arcos-app/backend 2>/dev/null | head -3 && echo '' && echo 'Note: Old directory /opt/arcos-app can be removed if not needed'"

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
