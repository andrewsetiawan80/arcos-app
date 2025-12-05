#!/bin/bash

cd src/assets/images/inspiration || exit 1

echo "🖼️  Optimizing inspiration images..."
echo "===================================="
echo ""

# Step 1: Resize PNG images to 512x512
echo "Step 1: Resizing images to 512x512..."
count=0
for img in *.png; do
    if [ -f "$img" ]; then
        sips -Z 512 "$img" --out "$img" > /dev/null 2>&1
        count=$((count + 1))
        if [ $((count % 20)) -eq 0 ]; then
            echo "  Resized $count images..."
        fi
    fi
done
echo "✅ Resized $count PNG images"
echo ""

# Step 2: Convert PNG to WebP
echo "Step 2: Converting PNG to WebP (quality 80)..."
webp_count=0
for img in *.png; do
    if [ -f "$img" ]; then
        webp_name="${img%.png}.webp"
        cwebp -q 80 -m 6 "$img" -o "$webp_name" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            webp_count=$((webp_count + 1))
            if [ $((webp_count % 20)) -eq 0 ]; then
                echo "  Converted $webp_count images..."
            fi
        fi
    fi
done
echo "✅ Converted $webp_count images to WebP"
echo ""

# Step 3: Show size comparison
echo "📊 Size comparison:"
png_size=$(du -sh *.png 2>/dev/null | awk '{sum+=$1} END {print sum}')
webp_size=$(du -sh *.webp 2>/dev/null | awk '{sum+=$1} END {print sum}')
echo "PNG total: $(du -sh . 2>/dev/null | grep -E '\.png' | wc -l) files"
echo "WebP total: $(ls -1 *.webp 2>/dev/null | wc -l) files"
echo ""
echo "Checking sizes..."
png_total=$(du -ch *.png 2>/dev/null | tail -1 | awk '{print $1}')
webp_total=$(du -ch *.webp 2>/dev/null | tail -1 | awk '{print $1}')
echo "PNG total size: $png_total"
echo "WebP total size: $webp_total"
echo ""
echo "✅ Optimization complete!"

