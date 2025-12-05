#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🚀 Deploying frontend to Proxmox"
puts "================================="

# Build frontend
puts "📦 Building frontend..."
spawn bash -c "npm run build"
expect {
    timeout {
        puts "❌ Build timeout"
        exit 1
    }
    eof
}
catch wait result
if {[lindex $result 3] != 0} {
    puts "❌ Build failed"
    exit 1
}
puts "✅ Frontend built"

# Copy dist files
puts "📤 Copying files to server..."
spawn scp -r dist/* $REMOTE_USER@$REMOTE_HOST:/var/www/cretewerkz/
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

# Copy images if needed
puts "🖼️  Ensuring images are in place..."
spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "mkdir -p /var/www/cretewerkz/assets/images && cp -r /opt/arcos-app/dist/assets/images/* /var/www/cretewerkz/assets/images/ 2>/dev/null || true"
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
puts "The updated frontend with error handling is now live."
puts "Check browser console for any image loading errors."
