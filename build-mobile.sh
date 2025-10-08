#!/bin/bash

# TickTrax Cordova Build Script
# This script builds the web app and copies it to the Cordova www directory

echo "🚀 Building TickTrax for Mobile..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
WEB_APP_DIR="$SCRIPT_DIR"
CORDOVA_DIR="$SCRIPT_DIR/mobile"
WWW_DIR="$CORDOVA_DIR/www"

echo "📦 Building web application..."
cd "$WEB_APP_DIR"

# Build the web app
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web app build failed!"
    exit 1
fi

echo "📱 Preparing Cordova project..."
cd "$CORDOVA_DIR"

# Clear existing www directory
if [ -d "$WWW_DIR" ]; then
    rm -rf "$WWW_DIR"/*
fi

# Copy built web app to Cordova www directory
echo "📋 Copying built files to Cordova..."
cp -r "$WEB_APP_DIR/build/"* "$WWW_DIR/"

# Create mobile-specific index.html if needed
if [ ! -f "$WWW_DIR/index.html" ]; then
    echo "⚠️  No index.html found, creating mobile-specific one..."
    cat > "$WWW_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>TickTrax</title>
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="color-scheme" content="light dark">
    
    <!-- Cordova script (will be injected by platform) -->
    <script type="text/javascript" src="cordova.js"></script>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #ffffff;
            overflow-x: hidden;
        }
        
        #app {
            min-height: 100vh;
            min-height: 100dvh;
        }
        
        /* Safe area handling */
        @supports (padding: max(0px)) {
            body {
                padding-left: max(0px, env(safe-area-inset-left));
                padding-right: max(0px, env(safe-area-inset-right));
            }
        }
        
        /* Loading screen */
        .app-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="app-loading">
            <div class="loading-spinner"></div>
        </div>
    </div>
    
    <script>
        // Wait for Cordova to be ready
        document.addEventListener('deviceready', function() {
            console.log('Cordova is ready!');
            
            // Initialize your app here
            if (window.initializeApp) {
                window.initializeApp();
            }
        }, false);
        
        // Fallback for web browsers
        if (!window.cordova) {
            document.addEventListener('DOMContentLoaded', function() {
                console.log('Running in web browser mode');
                if (window.initializeApp) {
                    window.initializeApp();
                }
            });
        }
    </script>
    
    <!-- Your app scripts -->
    <script type="module" src="./assets/index.js"></script>
</body>
</html>
EOF
fi

echo "🔧 Preparing platforms..."

# Prepare platforms
npx cordova prepare

echo "✅ Mobile build preparation complete!"
echo ""
echo "📱 To build for Android:"
echo "   cd mobile && npx cordova build android"
echo ""
echo "🍎 To build for iOS:"
echo "   cd mobile && npx cordova build ios"
echo ""
echo "🚀 To run on device:"
echo "   cd mobile && npx cordova run android"
echo "   cd mobile && npx cordova run ios"
echo ""
echo "🔍 To open in IDE:"
echo "   cd mobile && npx cordova open android"
echo "   cd mobile && npx cordova open ios"
