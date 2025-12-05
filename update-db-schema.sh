#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database schema"
puts "==========================="

set update_script "cd /opt/arcos-app && sudo -u postgres psql -d arcos_db -c \"ALTER TABLE inspiration_images ADD COLUMN IF NOT EXISTS full_image_url TEXT;\" && echo '' && echo '✅ Schema updated' && sudo -u postgres psql -d arcos_db -c \"SELECT COUNT(*) as total, COUNT(full_image_url) as with_full_url FROM inspiration_images;\""

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
