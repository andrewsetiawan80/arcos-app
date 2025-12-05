#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database URLs"
puts "========================="

set update_script "cd /opt/arcos-app/backend && cat > /tmp/update-webp.js << 'JSSCRIPT'
const { Pool } = require('pg');
require('dotenv').config({ path: '/opt/arcos-app/.env.production' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('UPDATE inspiration_images SET image_url = REPLACE(image_url, \\\".png\\\", \\\".webp\\\")')
  .then(res => {
    console.log('✅ Updated', res.rowCount, 'image URLs');
    return pool.query('SELECT image_url FROM inspiration_images LIMIT 3');
  })
  .then(res => {
    console.log('Sample URLs:');
    res.rows.forEach(row => console.log('  ', row.image_url));
    pool.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
JSSCRIPT
node /tmp/update-webp.js"

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
