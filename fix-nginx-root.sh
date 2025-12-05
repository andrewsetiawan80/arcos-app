#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Updating Nginx root to arcos-app"
puts "===================================="

set fix_script "sed -i 's|root /opt/arcos-app/dist;|root /opt/arcos-app/dist;|g' /etc/nginx/sites-enabled/default && echo '✅ Nginx config updated' && grep 'root' /etc/nginx/sites-enabled/default | grep -v '#' | head -1 && systemctl reload nginx && echo '✅ Nginx reloaded'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $fix_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
