#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating full_image_url in database"
puts "======================================"

set update_script "cd /opt/arcos-app && sudo -u postgres psql -d arcos_db << 'SQL'
UPDATE inspiration_images SET full_image_url = REPLACE(image_url, '.webp', '-full.webp');
UPDATE inspiration_images SET full_image_url = REPLACE(full_image_url, '/assets/images/inspiration/', '/assets/images/inspiration/high-res/');
SELECT image_url, full_image_url FROM inspiration_images LIMIT 3;
SQL
"

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
