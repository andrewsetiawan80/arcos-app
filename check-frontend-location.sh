#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking where frontend is served from"
puts "=========================================="

set check_script "echo '=== Nginx config ===' && grep -A 5 'location /' /etc/nginx/sites-enabled/default 2>/dev/null | head -10 && echo '' && echo '=== Frontend files ===' && ls -la /var/www/cretewerkz/index.html 2>/dev/null && echo '' && echo '=== Image files ===' && ls /var/www/cretewerkz/assets/images/inspiration/3d-tile-01.png 2>/dev/null && echo '✅ Image exists'"

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
