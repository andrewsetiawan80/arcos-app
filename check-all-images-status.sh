#!/bin/bash
echo "Checking all 126 images..."
missing=0
total=0

curl -s http://192.168.2.189/api/inspiration/images | jq -r '.[] | .imageUrl' | while read url; do
    filename=$(basename "$url")
    total=$((total + 1))
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://192.168.2.189$url" 2>/dev/null)
    if [ "$http_code" != "200" ]; then
        echo "❌ $filename: HTTP $http_code"
        missing=$((missing + 1))
    fi
done

echo ""
echo "Total checked: $total"
echo "Missing/broken: $missing"
