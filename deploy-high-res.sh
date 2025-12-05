#!/usr/bin/expect -f

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🚀 Deploying High-Res Images & Updates"
puts "======================================"

# Deploy frontend with high-res images
puts "📦 Creating deployment package..."
spawn bash -c "tar czf /tmp/arcos-high-res-deploy.tar.gz --exclude='node_modules' --exclude='.git' dist/ backend/src/ backend/package.json backend/package-lock.json backend/tsconfig.json .env.production 2>&1"
expect {
    timeout { puts "❌ Package timeout"; exit 1 }
    eof
}
catch wait result
puts "✅ Package created"

# Transfer
puts "📤 Transferring files..."
spawn scp -o StrictHostKeyChecking=no /tmp/arcos-high-res-deploy.tar.gz $REMOTE_USER@$REMOTE_HOST:/tmp/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect eof
    }
    timeout { puts "❌ Transfer timeout"; exit 1 }
    eof
}
puts "✅ Files transferred"

# Deploy on server
puts "🚀 Deploying on server..."
set deploy_script "cd /opt/arcos-app && tar xzf /tmp/arcos-high-res-deploy.tar.gz && rm /tmp/arcos-high-res-deploy.tar.gz && mkdir -p dist/assets/images/inspiration/high-res && cp -r dist/assets/images/inspiration/high-res/* dist/assets/images/inspiration/high-res/ 2>/dev/null || true && cd backend && npm install && npm run build && cd .. && echo '' && echo '✅ Deployment complete!'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $deploy_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            timeout { puts "❌ Deploy timeout"; exit 1 }
            eof
        }
    }
    eof
}

puts ""
puts "✅ High-res images deployed!"
puts ""
puts "Next steps:"
puts "1. Run migration: ALTER TABLE inspiration_images ADD COLUMN IF NOT EXISTS full_image_url TEXT;"
puts "2. Re-seed database with full_image_url"
puts ""
