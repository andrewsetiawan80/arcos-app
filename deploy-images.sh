#!/usr/bin/expect -f

# Deploy images to Proxmox server
set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"
set REMOTE_DIR "/var/www/cretewerkz"

puts "🖼️  Deploying images to Proxmox"
puts "======================================"
puts "   Host: $REMOTE_HOST"
puts "   Target: $REMOTE_DIR/assets/images"
puts ""

# Check if dist/assets/images exists
if {![file exists "dist/assets/images"]} {
    puts "❌ dist/assets/images not found. Building first..."
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
    puts "✅ Build complete"
}

puts "📦 Copying images folder..."
spawn scp -r dist/assets/images $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/assets/
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


