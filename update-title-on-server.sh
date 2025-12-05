#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Updating title on server"
puts "==========================="

set update_script "sed -i 's/Arcos - Concrete Management/Arcos - Concrete Management/g' /opt/arcos-app/dist/index.html && echo '✅ Title updated' && grep -i title /opt/arcos-app/dist/index.html"

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
