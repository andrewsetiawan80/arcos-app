#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Copying images to Nginx root"
puts "==============================="

set copy_script "echo 'Nginx root: /opt/arcos-app/dist' && echo 'Copying images...' && mkdir -p /opt/arcos-app/dist/assets/images && cp -r /var/www/cretewerkz/assets/images/* /opt/arcos-app/dist/assets/images/ 2>/dev/null && echo '✅ Images copied' && ls /opt/arcos-app/dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images in nginx root' && echo '' && echo 'Testing access...' && curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost/assets/images/inspiration/3d-tile-01.png"

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

puts ""
puts "✅ Images should now be accessible!"
