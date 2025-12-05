#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "✅ Verifying deployment"
puts "======================="

set verify_script "echo 'WebP count:' && ls /opt/arcos-app/dist/assets/images/inspiration/*.webp 2>/dev/null | wc -l && echo '' && echo 'Sample file:' && ls -lh /opt/arcos-app/dist/assets/images/inspiration/3d-tile-01.webp 2>/dev/null | awk '{print \$5}' && echo '' && echo 'Total WebP size:' && du -sh /opt/arcos-app/dist/assets/images/inspiration/*.webp 2>/dev/null | tail -1"

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
