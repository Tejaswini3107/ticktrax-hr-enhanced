#!/bin/bash

# TickTrax Vercel Deployment Script

echo "🚀 Starting TickTrax Vercel Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the TickTrax project directory"
    exit 1
fi

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    echo "   or use: npx vercel"
    exit 1
fi

# Build the application first
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

if command -v vercel &> /dev/null; then
    vercel
else
    npx vercel
fi

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📱 Your TickTrax application is now live on Vercel!"
    echo ""
    echo "🔑 Test with these credentials:"
    echo "   Employee: employee@example.com / password123"
    echo "   Manager:  manager@example.com / password123"
    echo "   HR:       tehr@example.com / password123"
    echo "   Admin:    admin@example.com / password123"
    echo ""
    echo "✨ Features to test:"
    echo "   - Clock in/out synchronization"
    echo "   - Role-based dashboards"
    echo "   - Time management"
    echo "   - Mobile responsiveness"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
