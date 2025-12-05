#!/usr/bin/expect -f

set timeout 60
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking database image URLs"
puts "================================"

set check_script "cd /opt/arcos-app/backend && cat > /tmp/check-urls.js << 'JSSCRIPT'
const { Pool } = require('pg');
require('dotenv').config({ path: '/opt/arcos-app/.env.production' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT image_url FROM inspiration_images LIMIT 10')
  .then(res => {
    console.log('Sample URLs:');
    res.rows.forEach((row, i) => console.log(\`  \${i+1}. \${row.image_url}\`));
    const webpCount = res.rows.filter(r => r.image_url.includes('.webp')).length;
    const pngCount = res.rows.filter(r => r.image_url.includes('.png')).length;
    console.log('');
    console.log('WebP URLs:', webpCount);
    console.log('PNG URLs:', pngCount);
    pool.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
JSSCRIPT
cd /opt/arcos-app/backend && node /tmp/check-urls.js 2>&1 || echo 'Node script failed, checking via psql...'"

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
