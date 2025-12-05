#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🖼️  Deploying WebP images to server"
puts "===================================="

set deploy_script "mkdir -p /opt/arcos-app/dist/assets/images/inspiration && echo '✅ Directory created'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $deploy_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}

puts "📤 Copying WebP images..."
spawn scp -r src/assets/images/inspiration/*.webp $REMOTE_USER@$REMOTE_HOST:/opt/arcos-app/dist/assets/images/inspiration/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}

puts "✅ WebP images deployed"

