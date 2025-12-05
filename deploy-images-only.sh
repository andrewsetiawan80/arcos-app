#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"
set REMOTE_DIR "/var/www/cretewerkz"

puts "🖼️  Deploying images only to Proxmox"
puts "======================================"
puts "   Host: $REMOTE_HOST"
puts ""

# Create directory structure
puts "📁 Creating directory structure..."
spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR/assets/images"
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect eof
    }
    eof
}

# Copy inspiration folder
puts "📦 Copying inspiration images..."
spawn scp -r dist/assets/images/inspiration $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/assets/images/
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


