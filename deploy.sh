#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod --yes --name ticktrax-frontend

echo "Deployment complete!"
