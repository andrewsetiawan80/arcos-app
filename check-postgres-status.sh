#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking PostgreSQL status"
puts "=============================="

set check_script "echo '=== PostgreSQL service ===' && systemctl status postgresql 2>/dev/null | head -5 || echo 'PostgreSQL not running as systemd service' && echo '' && echo '=== PostgreSQL Docker container ===' && docker ps -a | grep postgres || echo 'No PostgreSQL Docker container' && echo '' && echo '=== PostgreSQL process ===' && ps aux | grep postgres | grep -v grep | head -2 || echo 'No PostgreSQL process found' && echo '' && echo '=== Testing database connection ===' && PGPASSWORD=arcos_secure_password_change_me psql -h localhost -U arcos_user -d arcos_db -c 'SELECT version();' 2>&1 | head -3 || echo 'Database connection test failed'"

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
