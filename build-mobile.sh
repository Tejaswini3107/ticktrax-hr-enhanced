#!/bin/bash

# TickTrax HR Mobile Build Script
echo "🚀 Building TickTrax HR Mobile App..."

# Build the web application
echo "📦 Building web application..."
npm run build

# Copy built assets to mobile directory
echo "📱 Copying assets to mobile directory..."
cp -r www/* mobile/www/

# Navigate to mobile directory
cd mobile

# Prepare Cordova
echo "🔧 Preparing Cordova..."
npx cordova prepare

# Build for iOS
echo "🍎 Building for iOS..."
npx cordova build ios

echo "✅ Mobile app build complete!"
echo "📱 iOS app ready in: mobile/platforms/ios/"
echo "🔧 To run in simulator: cd mobile && npx cordova run ios"
echo "📦 To build for device: cd mobile && npx cordova build ios --device"
