#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking image locations"
puts "==========================="

set check_script "echo '=== Images in arcos-app ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images found' && echo '' && echo '=== Images in old location ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l 2>/dev/null || echo '0 (old location does not exist)' && echo '' && echo '=== Testing image access ===' && curl -s -I http://localhost/assets/images/inspiration/3d-tile-01.png | head -3"

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
