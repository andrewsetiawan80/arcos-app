#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking Docker service status"
puts "=================================="

set check_script "echo '=== Docker service status ===' && systemctl status arcos-app.service --no-pager | head -10 && echo '' && echo '=== Docker service file ===' && cat /etc/systemd/system/arcos-app.service 2>/dev/null | head -15 && echo '' && echo '=== What Docker was supposed to run ===' && cat /opt/arcos-app/docker-compose.yml 2>/dev/null | head -20 || echo 'docker-compose.yml not found'"

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
