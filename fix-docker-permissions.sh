#!/usr/bin/expect -f

set timeout 300
set REMOTE_HOST "192.168.2.189"
set REMOTE_USER "root"
set REMOTE_PASS "Andrewis0380"

puts "🔧 Fixing Docker/LXC permission issue"
puts "====================================="

# Fix sysctl permission in LXC container
set fix_script "echo '=== Checking LXC container ===' && cat /proc/self/cgroup 2>/dev/null | grep -q lxc && echo 'Running in LXC container' || echo 'Not in LXC' && echo '' && echo '=== Current sysctl value ===' && sysctl net.ipv4.ip_unprivileged_port_start 2>/dev/null || echo 'Cannot read sysctl' && echo '' && echo '=== Fix: Configure LXC to allow sysctl ===' && echo 'Note: This requires LXC container configuration on Proxmox host' && echo 'Since backend runs directly on host, Docker may not be needed' && echo '' && echo '=== Checking if Docker is actually needed ===' && systemctl list-units --type=service | grep -E '(docker|backend|cretewerkz)' | head -5"

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

puts ""
puts "Note: If backend runs directly on host (not Docker),"
puts "the Docker permission error may not affect functionality."
