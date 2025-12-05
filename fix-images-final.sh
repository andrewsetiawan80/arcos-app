#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing image paths - checking actual deployment"
puts "=================================================="

# Find where frontend is actually served from and copy images there
set fix_script "echo '=== Finding frontend location ===' && if [ -d /var/www/cretewerkz ]; then echo 'Frontend at: /var/www/cretewerkz' && ls -la /var/www/cretewerkz/dist/ 2>/dev/null | head -3; fi && echo '' && echo '=== Copying images to both locations ===' && mkdir -p /var/www/cretewerkz/dist/assets/images && mkdir -p /usr/share/nginx/html/assets/images && cp -r /var/www/cretewerkz/assets/images/* /var/www/cretewerkz/dist/assets/images/ 2>/dev/null && cp -r /var/www/cretewerkz/assets/images/* /usr/share/nginx/html/assets/images/ 2>/dev/null && echo '✅ Images copied' && echo '' && echo '=== Verifying ===' && ls -la /var/www/cretewerkz/dist/assets/images/inspiration/ 2>/dev/null | head -3 && ls -la /usr/share/nginx/html/assets/images/inspiration/ 2>/dev/null | head -3"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $fix_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}

puts ""
puts "✅ Fix complete!"
