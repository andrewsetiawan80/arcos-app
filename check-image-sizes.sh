#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "📊 Checking image sizes on server"
puts "=================================="

set check_script "echo '=== Inspiration images ===' && ls -lh /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | head -10 | awk '{print \$5, \$9}' && echo '' && echo '=== Total count ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo '' && echo '=== Sample file details ===' && file /opt/arcos-app/dist/assets/images/inspiration/3d-tile-01.png 2>/dev/null | head -1"

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
