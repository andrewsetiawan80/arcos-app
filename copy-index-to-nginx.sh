#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Copying updated index.html to Nginx root"
puts "==========================================="

set copy_script "cp /opt/arcos-app/dist/index.html /usr/share/nginx/html/index.html 2>/dev/null || cp /opt/arcos-app/dist/index.html /var/www/html/index.html 2>/dev/null || echo 'Checking other locations...' && find /etc/nginx -name '*.conf' -exec grep -l 'root' {} \\; | head -1 | xargs grep 'root' | head -1 && echo '' && echo '=== Updated index.html ===' && cat /opt/arcos-app/dist/index.html | grep -i title && systemctl reload nginx && echo '✅ Nginx reloaded'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $copy_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
