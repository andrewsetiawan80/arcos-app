#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🖼️  Deploying images to CORRECT location"
puts "========================================="
puts "   Target: /opt/arcos-app/dist/assets/images/inspiration/"
puts ""

# Copy images to the correct nginx root
spawn scp -r dist/assets/images/inspiration $REMOTE_USER@$REMOTE_HOST:/opt/arcos-app/dist/assets/images/
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
puts "   Images should now be accessible!"
