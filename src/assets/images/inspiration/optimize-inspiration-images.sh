#!/bin/bash

# Optimize inspiration images: resize and convert to WebP

cd src/assets/images/inspiration || exit 1

echo "🖼️  Optimizing inspiration images..."
echo "===================================="

# Check if sips is available (macOS)
if command -v sips &> /dev/null; then
    echo "✅ Using sips for resizing..."
    
    # Resize all PNG images to 512x512 (maintains aspect ratio, fits within)
    for img in *.png; do
        if [ -f "$img" ]; then
            echo "Resizing: $img"
            sips -Z 512 "$img" --out "$img" > /dev/null 2>&1
        fi
    done
    echo "✅ Resizing complete"
else
    echo "⚠️  sips not available, skipping resize"
fi

# Check if cwebp is available
if command -v cwebp &> /dev/null; then
    echo "✅ Converting PNG to WebP..."
    count=0
    for img in *.png; do
        if [ -f "$img" ]; then
            webp_name="${img%.png}.webp"
            echo "Converting: $img -> $webp_name"
            cwebp -q 80 -m 6 "$img" -o "$webp_name" > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                count=$((count + 1))
            fi
        fi
    done
    echo "✅ Converted $count images to WebP"
else
    echo "⚠️  cwebp not available. Install with: brew install webp"
    echo "   Or use online tools like Squoosh.app"
    exit 1
fi

# Show size comparison
echo ""
echo "📊 Size comparison:"
echo "PNG total: $(du -sh ./*.png 2>/dev/null | awk '{sum+=$1} END {print sum "MB"}')"
echo "WebP total: $(du -sh ./*.webp 2>/dev/null | awk '{sum+=$1} END {print sum "MB"}')"

