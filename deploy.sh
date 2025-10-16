#!/bin/bash

# TickTrax Docker Deployment Script

echo "🚀 Starting TickTrax Docker Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start the application
echo "🔨 Building and starting TickTrax..."
docker-compose up --build -d

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ TickTrax is running successfully!"
    echo "🌐 Application is available at: http://localhost:3000"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo "📊 Container status:"
docker-compose ps

echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
