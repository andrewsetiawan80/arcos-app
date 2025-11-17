#!/usr/bin/expect -f

# Full stack deployment script using expect for password authentication
# This builds frontend, backend, and deploys everything to Proxmox LXC

set timeout 600
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"
set REMOTE_DIR "/opt/cretewerkz-app"

puts "🚀 Deploying Full Stack to Proxmox LXC"
puts "======================================"
puts "   Host: $REMOTE_HOST"
puts "   User: $REMOTE_USER"
puts ""

# Check if .env.production exists
if {![file exists .env.production]} {
    puts "⚠️  .env.production not found. Creating from template..."
    set fp [open .env.production w]
    puts $fp "DB_PASSWORD=arqon_secure_password_change_me"
    puts $fp "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars"
    puts $fp "CORS_ORIGIN=http://localhost:80,http://localhost,http://192.168.2.189"
    puts $fp "VITE_API_URL=http://localhost:3001/api"
    close $fp
    puts "✅ Created .env.production (using default values)"
}

puts "📦 Building frontend..."
spawn bash -c "npm run build"
expect {
    timeout {
        puts "❌ Frontend build timeout"
        exit 1
    }
    eof
}
catch wait result
if {[lindex $result 3] != 0} {
    puts "❌ Frontend build failed"
    exit 1
}
puts "✅ Frontend built successfully"

puts "📦 Building backend..."
spawn bash -c "cd backend && npm install && npm run build"
expect {
    timeout {
        puts "❌ Backend build timeout"
        exit 1
    }
    eof
}
catch wait result
if {[lindex $result 3] != 0} {
    puts "❌ Backend build failed"
    exit 1
}
puts "✅ Backend built successfully"

puts "📦 Creating deployment package..."
spawn bash -c "tar czf /tmp/cretewerkz-full-deploy.tar.gz --exclude='node_modules' --exclude='.git' dist/ backend/src/ backend/package.json backend/package-lock.json backend/tsconfig.json backend/Dockerfile backend/.dockerignore docker-compose.yml nginx.conf .env.production cretewerkz-fullstack.service 2>&1"
expect {
    timeout {
        puts "❌ Package creation timeout"
        exit 1
    }
    eof
}
catch wait result
if {[lindex $result 3] != 0} {
    puts "❌ Package creation failed"
    exit 1
}
puts "✅ Package created"

puts "🔌 Testing connection..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "echo 'Connected'"
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            "Connected" {
                puts "✅ Connection successful"
            }
            timeout {
                puts "❌ Connection failed"
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

puts "🐳 Checking Docker..."
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "command -v docker && docker --version"
expect "password:"
send "$REMOTE_PASS\r"
expect {
    "docker" {
        puts "✅ Docker is installed"
        expect eof
    }
    eof {
        puts "📦 Installing Docker..."
        spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST "curl -fsSL https://get.docker.com | sh && apt-get install -y docker-compose-plugin"
        expect "password:"
        send "$REMOTE_PASS\r"
        expect eof
        puts "✅ Docker installed"
    }
}

puts "📤 Transferring files to $REMOTE_HOST..."
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/cretewerkz-full-deploy.tar.gz $REMOTE_USER@$REMOTE_HOST:/tmp/
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect eof
    }
    timeout {
        puts "❌ Transfer timeout"
        exit 1
    }
}
puts "✅ Files transferred"

puts "🚀 Deploying on remote server..."
set deploy_script "mkdir -p $REMOTE_DIR && cd $REMOTE_DIR && tar xzf /tmp/cretewerkz-full-deploy.tar.gz && rm /tmp/cretewerkz-full-deploy.tar.gz && docker stop cretewerkz-app 2>/dev/null || true && docker rm cretewerkz-app 2>/dev/null || true && docker compose --env-file .env.production down 2>/dev/null || true && docker compose --env-file .env.production up -d --build && sleep 15 && docker compose --env-file .env.production ps && echo '' && echo '✅ Deployment complete!' && echo 'Services running:' && echo '  🌐 Frontend:  http://$REMOTE_HOST' && echo '  🔌 Backend:   http://$REMOTE_HOST:3001' && echo '' && echo 'Default admin: admin@arqon.com / admin123'"
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $REMOTE_USER@$REMOTE_HOST $deploy_script

expect "password:"
send "$REMOTE_PASS\r"
expect {
    timeout {
        puts "❌ Deployment timeout"
        exit 1
    }
    eof
}

puts ""
puts "✅ Remote deployment complete!"
puts ""
puts "Access your app at: http://$REMOTE_HOST"
puts "Default admin: admin@arqon.com / admin123"
puts ""
puts "To view logs on server:"
puts "  ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker compose logs -f'"

