#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database to use WebP URLs"
puts "======================================"

set update_script "cd /opt/arcos-app/backend && export PATH=\$PATH:/usr/local/bin:/opt/arcos-app/backend/node_modules/.bin && source /opt/arcos-app/.env.production 2>/dev/null || true && PGPASSWORD=\$(grep DB_PASSWORD /opt/arcos-app/.env.production 2>/dev/null | cut -d'=' -f2) psql -h localhost -U postgres -d arcos_db -c \"UPDATE inspiration_images SET image_url = REPLACE(image_url, '.png', '.webp');\" 2>&1 && echo '' && echo '✅ Database updated' && PGPASSWORD=\$(grep DB_PASSWORD /opt/arcos-app/.env.production 2>/dev/null | cut -d'=' -f2) psql -h localhost -U postgres -d arcos_db -c \"SELECT image_url FROM inspiration_images LIMIT 3;\" 2>&1"

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
