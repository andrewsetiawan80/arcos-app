#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking backend service status"
puts "==================================="

set check_script "echo '=== Backend service status ===' && systemctl status arcos-backend.service --no-pager | head -15 && echo '' && echo '=== Testing backend API ===' && curl -s http://localhost:3001/api/health 2>/dev/null | head -3 || echo 'Backend not responding' && echo '' && echo '=== Checking if backend process is running ===' && ps aux | grep -E 'node|tsx|backend' | grep -v grep | head -3"

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
