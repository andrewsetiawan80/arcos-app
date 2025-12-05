#!/bin/bash
# Build APK script for Arcos Mobile App

set -e

echo "🚀 Starting APK build process..."
echo ""

cd "$(dirname "$0")"

# Check if logged in
echo "Checking EAS login status..."
if ! npx eas-cli whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Expo. Please run: npx eas-cli login"
    exit 1
fi

echo "✅ Logged in as: $(npx eas-cli whoami)"
echo ""

# Initialize project if needed
if [ ! -f "app.json" ] || ! grep -q "projectId" app.json 2>/dev/null; then
    echo "📦 Initializing EAS project..."
    npx eas-cli init
    echo ""
fi

# Build APK
echo "🔨 Building Android APK..."
echo "This will take approximately 10-15 minutes..."
echo ""

npx eas-cli build --platform android --profile preview

echo ""
echo "✅ Build process completed!"
echo "Check the output above for the download link to your APK."

