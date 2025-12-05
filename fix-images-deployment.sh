#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Ensuring images are copied correctly"
puts "======================================="

set fix_script "cd /opt/arcos-app && echo 'Checking images...' && if test -d dist/assets/images/inspiration && test \$(ls dist/assets/images/inspiration/*.png 2>/dev/null | wc -l) -gt 0; then echo '✅ Images present'; else echo '⚠️  Images missing, copying...' && mkdir -p dist/assets/images && cp -r /opt/arcos-app/dist/assets/images/* dist/assets/images/ 2>/dev/null && echo '✅ Images copied'; fi && ls dist/assets/images/inspiration/*.png 2>/dev/null | wc -l && echo 'images available'"

spawn ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST $fix_script
expect {
    "password:" {
        send "$REMOTE_PASS\r"
        expect {
            eof
        }
    }
    eof
}
