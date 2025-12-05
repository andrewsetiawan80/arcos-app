#!/usr/bin/expect -f

set timeout 120
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔄 Updating database URLs"
puts "=========================="

set update_script "cd /opt/arcos-app/backend && cat > /tmp/update-webp.mjs << 'JSSCRIPT'
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from production file
const envFile = readFileSync('/opt/arcos-app/.env.production', 'utf8');
const env = {};
envFile.split('\\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const pool = new Pool({
  connectionString: \`postgresql://postgres:\${env.DB_PASSWORD}@localhost:5432/arcos_db\`
});

try {
  const result = await pool.query('UPDATE inspiration_images SET image_url = REPLACE(image_url, \\\".png\\\", \\\".webp\\\")');
  console.log('✅ Updated', result.rowCount, 'rows');
  
  const check = await pool.query('SELECT image_url FROM inspiration_images LIMIT 5');
  console.log('Sample URLs:');
  check.rows.forEach(r => console.log(' ', r.image_url));
  
  await pool.end();
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
JSSCRIPT
node --experimental-modules /tmp/update-webp.mjs 2>&1 || node /tmp/update-webp.mjs 2>&1"

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
