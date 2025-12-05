#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Copying images to new location"
puts "=================================="

set copy_script "mkdir -p /opt/arcos-app/dist/assets/images && if [ -d /opt/arcos-app/dist/assets/images ]; then cp -r /opt/arcos-app/dist/assets/images/* /opt/arcos-app/dist/assets/images/ 2>/dev/null && echo '✅ Copied from old location'; elif [ -d /opt/arcos-app/dist/assets/images/inspiration ]; then echo '✅ Images already in new location'; else echo '⚠️  No images found, checking deployment...'; fi && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images now in arcos-app'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $copy_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
