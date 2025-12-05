#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Verifying all image files exist"
puts "==================================="

set verify_script "echo '=== Checking 3D tiles (01-105) ===' && for i in {1..105}; do num=\$(printf '%02d' \$i); if [ ! -f /var/www/cretewerkz/assets/images/inspiration/3d-tile-\$num.png ]; then echo \"Missing: 3d-tile-\$num.png\"; fi; done | head -20 && echo '' && echo '=== Checking other categories ===' && ls /var/www/cretewerkz/assets/images/inspiration/concrete-panel-*.png 2>/dev/null | wc -l && echo 'concrete-panel images' && ls /var/www/cretewerkz/assets/images/inspiration/textured-microcement-*.png 2>/dev/null | wc -l && echo 'textured-microcement images'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $verify_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
