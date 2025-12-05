#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating arcos_db URLs"
puts "========================="

set update_script "cd /opt/arcos-app && DB_PASS=\$(grep DB_PASSWORD .env.production | cut -d'=' -f2) && PGPASSWORD=\$DB_PASS psql -h localhost -U postgres -d arcos_db -c \"UPDATE inspiration_images SET image_url = REPLACE(image_url, '.png', '.webp');\" && echo '' && echo '✅ Database updated' && PGPASSWORD=\$DB_PASS psql -h localhost -U postgres -d arcos_db -c \"SELECT image_url FROM inspiration_images LIMIT 5;\""

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
