#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "✅ Final Verification"
puts "===================="

set verify_script "echo '1. Backend status:' && systemctl is-active arcos-backend.service && echo '' && echo '2. WebP images:' && ls /opt/arcos-app/dist/assets/images/inspiration/*.webp 2>/dev/null | wc -l && echo '' && echo '3. Backend logs (last 5 lines):' && journalctl -u arcos-backend.service -n 5 --no-pager | tail -3"

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
