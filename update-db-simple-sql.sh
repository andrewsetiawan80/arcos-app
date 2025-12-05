#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database (simple SQL)"
puts "=================================="

set update_script "cd /opt/arcos-app/backend && cat > /tmp/update.sql << 'SQL'
UPDATE inspiration_images SET image_url = REPLACE(image_url, '.png', '.webp');
SELECT image_url FROM inspiration_images LIMIT 3;
SQL
DB_PASS=\$(grep DB_PASSWORD /opt/arcos-app/.env.production | cut -d'=' -f2) && sudo -u postgres psql -d arcos_db -f /tmp/update.sql 2>&1 | head -10"

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
