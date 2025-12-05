#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Verifying images after deployment"
puts "===================================="

set verify_script "echo '=== Images in dist/assets/images ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images' && echo '' && echo '=== Testing a few images ===' && curl -s -I http://localhost/assets/images/inspiration/3d-tile-01.png | head -1 && curl -s -I http://localhost/assets/images/inspiration/textured-microcement-01.png | head -1 && curl -s -I http://localhost/assets/images/inspiration/bespoke-01.png | head -1"

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
