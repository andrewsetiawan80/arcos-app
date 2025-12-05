#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking deployment status on Proxmox"
puts "========================================="

set check_script "echo '=== Title in index.html ===' && grep -i '<title>' /opt/arcos-app/dist/index.html && echo '' && echo '=== Images count ===' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images' && echo '' && echo '=== Nginx root ===' && grep 'root' /etc/nginx/sites-enabled/default | grep -v '#' | grep 'root' | head -1 && echo '' && echo '=== Last deployment time ===' && stat -c '%y' /opt/arcos-app/dist/index.html 2>/dev/null || stat -f '%Sm' /opt/arcos-app/dist/index.html 2>/dev/null"

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
