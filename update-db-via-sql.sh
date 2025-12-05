#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database via SQL"
puts "============================="

set update_script "cd /opt/arcos-app && DB_PASS=\$(grep DB_PASSWORD .env.production | cut -d'=' -f2) && sudo -u postgres psql arcos_db -c \"UPDATE inspiration_images SET image_url = REPLACE(image_url, '.png', '.webp');\" && echo '' && echo '✅ Updated' && sudo -u postgres psql arcos_db -c \"SELECT COUNT(*) as total, COUNT(CASE WHEN image_url LIKE '%.webp' THEN 1 END) as webp_count FROM inspiration_images;\""

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
