#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🖼️  Updating favicon on server"
puts "=============================="

set update_script "cd /opt/arcos-app && if [ -f dist/favicon.png ]; then cp dist/favicon.png /opt/arcos-app/dist/favicon.png && echo '✅ Favicon updated on server'; else echo '⚠️  Favicon not found in dist'; fi"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $update_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
