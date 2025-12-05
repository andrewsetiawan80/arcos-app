#!/bin/bash

# Create high-resolution versions (1024x1024) for modal display
# Keep 512x512 for thumbnails

cd src/assets/images/inspiration || exit 1

echo "🖼️  Creating high-resolution images for modal..."
echo "================================================"
echo ""

# Check if sips is available (macOS)
if ! command -v sips &> /dev/null; then
    echo "❌ sips not available. This script requires macOS."
    exit 1
fi

# Check if cwebp is available
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not available. Install with: brew install webp"
    exit 1
fi

# Create high-res directory
mkdir -p high-res

count=0
for img in *.png; do
    if [ -f "$img" ]; then
        base_name="${img%.png}"
        high_res_png="high-res/${base_name}-full.png"
        high_res_webp="high-res/${base_name}-full.webp"
        
        echo "Processing: $img"
        
        # Resize to 1024x1024 (maintains aspect ratio, fits within)
        sips -Z 1024 "$img" --out "$high_res_png" > /dev/null 2>&1
        
        # Convert to WebP with higher quality for modal
        cwebp -q 90 -m 6 "$high_res_png" -o "$high_res_webp" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            count=$((count + 1))
            # Remove temporary PNG
            rm "$high_res_png"
        fi
        
        if [ $((count % 20)) -eq 0 ]; then
            echo "  Processed $count images..."
        fi
    fi
done

echo ""
echo "✅ Created $count high-resolution images"
echo "📊 Size comparison:"
echo "Thumbnails (512x512): $(du -sh ./*.webp 2>/dev/null | awk '{sum+=$1} END {print sum "MB"}')"
echo "High-res (1024x1024): $(du -sh ./high-res/*.webp 2>/dev/null | awk '{sum+=$1} END {print sum "MB"}')"
