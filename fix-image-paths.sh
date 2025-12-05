#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing image paths on server"
puts "======================================"

# Check nginx root and copy images to correct location
set fix_script "NGINX_ROOT=\$(grep 'root' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';') && echo \"Nginx root: \$NGINX_ROOT\" && if [ -d /var/www/cretewerkz/assets/images ]; then mkdir -p \$NGINX_ROOT/assets/images && cp -r /var/www/cretewerkz/assets/images/* \$NGINX_ROOT/assets/images/ 2>/dev/null && echo \"✅ Images copied to nginx root\" && ls -la \$NGINX_ROOT/assets/images/inspiration/ | head -5; else echo \"❌ Source images not found\"; fi"

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
puts "✅ Path fix complete!"
