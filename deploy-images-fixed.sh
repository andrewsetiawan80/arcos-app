#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"
set REMOTE_DIR "/var/www/cretewerkz"

puts "🖼️  Deploying images to Proxmox"
puts "======================================"
puts "   Host: $REMOTE_HOST"
puts ""

# First, create the assets/images directory structure
puts "📁 Creating directory structure..."
spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR/assets/images/inspiration"
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof {
                puts "✅ Directory created"
            }
            timeout {
                puts "⚠️  Timeout, continuing..."
            }
        }
    }
    eof
}

# Now copy images
puts "📦 Copying images folder..."
spawn scp -r dist/assets/images/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/assets/images/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof {
                puts "✅ Images deployed successfully"
            }
            timeout {
                puts "❌ Deployment timeout"
                exit 1
            }
        }
    }
    "Permission denied" {
        puts "❌ Authentication failed"
        exit 1
    }
    timeout {
        puts "❌ Connection timeout"
        exit 1
    }
}

puts ""
puts "✅ Image deployment complete!"
puts "   Images available at: http://$REMOTE_HOST/assets/images/inspiration/"
