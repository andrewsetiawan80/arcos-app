#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Finding database"
puts "==================="

set check_script "sudo -u postgres psql -l | grep -E 'arcos|arcos|cretewerkz' || echo 'Checking all databases...' && sudo -u postgres psql -l | grep '^ arcos' || sudo -u postgres psql -l | grep '^ arcos' || sudo -u postgres psql -l | head -10"

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
