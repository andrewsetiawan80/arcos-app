#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Renaming service file on server"
puts "==================================="

set rename_script "if [ -f /etc/systemd/system/arcos-backend.service ]; then mv /etc/systemd/system/arcos-backend.service /etc/systemd/system/arcos-backend.service && sed -i 's/Arcos Backend API/Arcos Backend API/g' /etc/systemd/system/arcos-backend.service && sed -i 's|/opt/arcos-app|/opt/arcos-app|g' /etc/systemd/system/arcos-backend.service && systemctl daemon-reload && systemctl enable arcos-backend.service && systemctl restart arcos-backend.service && echo '✅ Service renamed and restarted' && systemctl status arcos-backend.service --no-pager | head -5; else echo 'Service file not found'; fi"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $rename_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
