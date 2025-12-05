#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking Nginx root configuration"
puts "====================================="

set check_script "echo '=== Nginx root directive ===' && grep 'root' /etc/nginx/sites-enabled/default 2>/dev/null | head -3 && echo '' && echo '=== Testing image access ===' && curl -s -o /dev/null -w 'Direct access: %{http_code}\n' http://localhost/assets/images/inspiration/3d-tile-01.png && echo '' && echo '=== File exists check ===' && test -f /var/www/cretewerkz/assets/images/inspiration/3d-tile-01.png && echo '✅ File exists' || echo '❌ File missing'"

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
