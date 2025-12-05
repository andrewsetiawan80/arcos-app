#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🌱 Re-seeding inspiration data"
puts "==============================="

set seed_script "cd /opt/arcos-app/backend && npm run db:seed-inspiration 2>&1 | tail -20"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $seed_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
