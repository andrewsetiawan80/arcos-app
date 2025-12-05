#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing title on server"
puts "========================="

set fix_script "sed -i 's/<title>.*<\/title>/<title>Arcos<\/title>/g' /opt/arcos-app/dist/index.html && echo '✅ Title fixed' && cat /opt/arcos-app/dist/index.html | grep -i '<title>' && systemctl reload nginx && echo '✅ Nginx reloaded'"

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
