#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking image formats on server"
puts "===================================="

set check_script "echo '=== WebP images ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.webp 2>/dev/null | wc -l && echo '' && echo '=== PNG images ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo '' && echo '=== Sample file formats ===' && file /opt/arcos-app/dist/assets/images/inspiration/3d-tile-01.* 2>/dev/null | head -3"

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
