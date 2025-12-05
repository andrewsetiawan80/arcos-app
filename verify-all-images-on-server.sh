#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔍 Verifying all images exist and are accessible"
puts "================================================="

set verify_script "echo '=== Counting files ===' && find /var/www/cretewerkz/assets/images/inspiration -name '*.png' -type f | wc -l && echo 'PNG files found' && echo '' && echo '=== Checking file sizes ===' && ls -lh /var/www/cretewerkz/assets/images/inspiration/*.png | awk '{if (\$5 == \"0\") print \"⚠️  Zero size:\", \$9}' | head -10 && echo '' && echo '=== Checking permissions ===' && ls -l /var/www/cretewerkz/assets/images/inspiration/*.png | awk '{if (\$1 !~ /^-r/) print \"⚠️  Wrong permissions:\", \$9}' | head -5 && echo '' && echo '=== Testing HTTP access ===' && for i in 1 50 100; do num=\$(printf '%02d' \$i); curl -s -o /dev/null -w \"3d-tile-\$num.png: %{http_code}\n\" http://localhost/assets/images/inspiration/3d-tile-\$num.png; done"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $verify_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
