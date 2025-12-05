#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Ensuring images are in deployment"
puts "===================================="

set ensure_script "cd /opt/arcos-app && if [ ! -d dist/assets/images/inspiration ] || [ \$(ls dist/assets/images/inspiration/*.png 2>/dev/null | wc -l) -eq 0 ]; then echo '⚠️  Images missing, copying from old location...' && mkdir -p dist/assets/images && cp -r /opt/arcos-app/dist/assets/images/* dist/assets/images/ 2>/dev/null && echo '✅ Images copied'; else echo '✅ Images already present'; fi && ls dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images available' && systemctl reload nginx && echo '✅ Nginx reloaded'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $ensure_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
