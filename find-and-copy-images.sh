#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Finding frontend location and copying images"
puts "================================================"

set find_script "echo '=== Finding frontend assets ===' && find /var/www /usr/share/nginx/html -name 'index-*.js' -type f 2>/dev/null | head -3 && echo '' && echo '=== Checking dist location ===' && ls -la /opt/arcos-app/dist/assets/ 2>/dev/null | head -5 && echo '' && echo '=== Copying images from dist ===' && mkdir -p /var/www/cretewerkz/assets/images && cp -r /opt/arcos-app/dist/assets/images/* /var/www/cretewerkz/assets/images/ 2>/dev/null && echo '✅ Images copied to /var/www/cretewerkz/assets/images/' && ls -la /var/www/cretewerkz/assets/images/inspiration/ | head -5"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $find_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
