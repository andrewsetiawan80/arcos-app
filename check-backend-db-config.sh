#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking backend database configuration"
puts "=========================================="

set check_script "echo '=== Backend service file ===' && cat /etc/systemd/system/arcos-backend.service && echo '' && echo '=== Backend .env file ===' && cat /opt/arcos-app/.env.production 2>/dev/null | grep -E 'DATABASE|DB_' || echo 'No .env.production found' && echo '' && echo '=== PostgreSQL databases ===' && sudo -u postgres psql -l 2>/dev/null | grep -E 'Name|arcos' || echo 'Checking databases...'"

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
