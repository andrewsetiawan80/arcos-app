#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking actual nginx configuration"
puts "====================================="

set check_script "echo '=== Active nginx config ===' && cat /etc/nginx/sites-enabled/default 2>/dev/null | grep -A 5 'root' | head -10 && echo '' && echo '=== Testing image path ===' && ls -la /usr/share/nginx/html/assets/images/inspiration/3d-tile-01.png 2>&1 && echo '' && echo '=== Testing direct access ===' && curl -I http://localhost/assets/images/inspiration/3d-tile-01.png 2>&1 | head -3"

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
