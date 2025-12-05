#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Checking and fixing Nginx image serving"
puts "==========================================="

set fix_script "echo '=== Current nginx root ===' && grep '^[[:space:]]*root' /etc/nginx/sites-enabled/default 2>/dev/null && echo '' && echo '=== Checking if we need to update root ===' && if grep -q 'root /usr/share/nginx/html' /etc/nginx/sites-enabled/default; then echo '⚠️  Nginx root is /usr/share/nginx/html but files are in /var/www/cretewerkz'; echo 'Copying images to nginx root...'; mkdir -p /usr/share/nginx/html/assets/images && cp -r /var/www/cretewerkz/assets/images/* /usr/share/nginx/html/assets/images/ 2>/dev/null && echo '✅ Images copied'; else echo '✅ Root matches file location'; fi && echo '' && echo '=== Testing ===' && curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost/assets/images/inspiration/3d-tile-01.png"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $fix_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
