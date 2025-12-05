#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking Nginx configuration"
puts "================================="

set check_script "echo '=== Nginx root ===' && grep 'root' /etc/nginx/sites-enabled/default | grep -v '#' | head -3 && echo '' && echo '=== Checking index.html locations ===' && ls -la /opt/arcos-app/dist/index.html 2>/dev/null && echo '' && ls -la /usr/share/nginx/html/index.html 2>/dev/null || echo 'Not in /usr/share/nginx/html' && echo '' && echo '=== Content of /opt/arcos-app/dist/index.html ===' && head -15 /opt/arcos-app/dist/index.html | grep -i title"

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
