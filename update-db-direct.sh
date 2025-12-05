#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database URLs directly"
puts "==================================="

set update_script "cd /opt/arcos-app && source .env.production 2>/dev/null && export PGPASSWORD=\$DB_PASSWORD && psql -h localhost -U postgres -d arcos_db -c \"UPDATE inspiration_images SET image_url = REPLACE(image_url, '.png', '.webp');\" && echo '' && echo '✅ Database updated' && psql -h localhost -U postgres -d arcos_db -c \"SELECT image_url FROM inspiration_images LIMIT 5;\""

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
