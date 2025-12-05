#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database via backend connection"
puts "============================================"

set update_script "cd /opt/arcos-app/backend && node -e \"const { Pool } = require('pg'); require('dotenv').config({ path: '/opt/arcos-app/.env.production' }); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('UPDATE inspiration_images SET image_url = REPLACE(image_url, \\\".png\\\", \\\".webp\\\")').then(() => { console.log('✅ Updated', res.rowCount, 'rows'); pool.query('SELECT image_url FROM inspiration_images LIMIT 3').then(r => { console.log('Sample URLs:'); r.rows.forEach(row => console.log(row.image_url)); pool.end(); }); }).catch(e => { console.error('Error:', e.message); process.exit(1); });\""

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
