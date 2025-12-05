#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🐳 Copying images to Docker container"
puts "======================================"

# Copy images to Docker container if it exists
set copy_script "if docker ps | grep -q frontend; then CONTAINER=\$(docker ps | grep frontend | awk '{print \$1}') && echo \"Found container: \$CONTAINER\" && docker exec \$CONTAINER mkdir -p /usr/share/nginx/html/assets/images && docker cp dist/assets/images/inspiration \$CONTAINER:/usr/share/nginx/html/assets/images/ && echo \"✅ Images copied to container\" && docker exec \$CONTAINER ls -la /usr/share/nginx/html/assets/images/inspiration/ | head -5; else echo \"No frontend container found, copying to host\"; mkdir -p /usr/share/nginx/html/assets/images && cp -r /var/www/cretewerkz/assets/images/* /usr/share/nginx/html/assets/images/ 2>/dev/null && ls -la /usr/share/nginx/html/assets/images/inspiration/ | head -5; fi"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $copy_script
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
puts "✅ Complete!"
