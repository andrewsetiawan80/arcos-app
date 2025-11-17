#!/bin/bash

# Arqon Mobile Development Script

echo "🚀 Starting Arqon Mobile App Development..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the arqon-mobile directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🎯 Starting Expo development server..."
echo "📱 Open the Expo Go app on your phone and scan the QR code"
echo "💻 Or press 'i' for iOS simulator, 'a' for Android emulator"
echo ""

npm start







