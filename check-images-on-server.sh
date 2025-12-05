#!/bin/bash
echo "Checking if images exist on server..."
ssh root@192.168.2.189 "ls -la /var/www/cretewerkz/assets/images/inspiration/*.png 2>&1 | head -10"
echo ""
echo "Checking if assets folder exists..."
ssh root@192.168.2.189 "ls -la /var/www/cretewerkz/assets/ 2>&1 | head -10"
