#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🖼️  Deploying images directly to nginx root"
puts "======================================"

# Copy inspiration folder directly to nginx root
puts "📦 Copying inspiration images..."
spawn scp -r dist/assets/images/inspiration $REMOTE_USER@$REMOTE_HOST:/usr/share/nginx/html/assets/images/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof {
                puts "✅ Images deployed successfully"
            }
        }
    }
    eof
}

puts ""
puts "✅ Image deployment complete!"
puts "   Images available at: http://$REMOTE_HOST/assets/images/inspiration/"
