#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🖼️  Deploying images to dist folder"
puts "======================================"

# Copy images directly to dist folder
spawn scp -r dist/assets/images/inspiration $REMOTE_USER@$REMOTE_HOST:/var/www/cretewerkz/dist/assets/images/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof {
                puts "✅ Images deployed to dist folder"
            }
        }
    }
    eof
}

puts ""
puts "✅ Complete!"
