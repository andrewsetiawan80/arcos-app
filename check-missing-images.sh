#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Checking for missing images"
puts "=============================="

set check_script "echo '=== Images in database (sample) ===' && psql -U arcos_user -d arcos_db -t -c \"SELECT image_url FROM inspiration_images LIMIT 10;\" 2>/dev/null | head -10 && echo '' && echo '=== Images on server ===' && ls /var/www/cretewerkz/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'PNG files found' && echo '' && echo '=== Checking specific images ===' && ls /var/www/cretewerkz/assets/images/inspiration/3d-tile-{01..10}.png 2>/dev/null | wc -l && echo '3d-tile-01 to 10 found' && ls /var/www/cretewerkz/assets/images/inspiration/microcement-*.png 2>/dev/null | wc -l && echo 'microcement images found' && ls /var/www/cretewerkz/assets/images/inspiration/bespoke-*.png 2>/dev/null | wc -l && echo 'bespoke images found'"

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
