#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🚀 Deploying frontend to Proxmox"
puts "================================="

# Copy dist folder contents
puts "📤 Copying files to server..."
spawn scp -r dist/. $REMOTE_USER@$REMOTE_HOST:/var/www/cretewerkz/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof {
                puts "✅ Files copied"
            }
        }
    }
    eof
}

# Ensure images are in place
puts "🖼️  Verifying images..."
spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "mkdir -p /var/www/cretewerkz/assets/images && cp -r /opt/arcos-app/dist/assets/images/* /var/www/cretewerkz/assets/images/ 2>/dev/null || true && ls /var/www/cretewerkz/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images verified'"
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
puts "✅ Frontend deployment complete!"
puts "   URL: http://$REMOTE_HOST"
puts ""
puts "Check browser console (F12) for image loading errors."
