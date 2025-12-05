#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Disabling Docker service (backend runs directly)"
puts "=================================================="

set disable_script "systemctl stop arcos-app.service && systemctl disable arcos-app.service && echo '✅ Docker service disabled' && echo '' && echo 'Backend is running directly via:' && systemctl status arcos-backend.service --no-pager | head -3"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $disable_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
