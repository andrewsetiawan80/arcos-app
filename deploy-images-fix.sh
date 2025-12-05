#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🖼️  Deploying images - creating directory first"
puts "==============================================="

# Create directory structure first
set create_script "mkdir -p /opt/arcos-app/dist/assets/images && echo 'Directory created'"
spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $create_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect eof
    }
    eof
}

# Now copy images
puts "📦 Copying images..."
spawn scp -r dist/assets/images/inspiration $REMOTE_USER@$REMOTE_HOST:/opt/arcos-app/dist/assets/images/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof {
                puts "✅ Images deployed!"
            }
        }
    }
    eof
}

puts ""
puts "✅ Complete! Testing..."
