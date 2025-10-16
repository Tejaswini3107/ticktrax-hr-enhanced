# TickTrax Docker Deployment

This document provides instructions for deploying TickTrax using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Option 1: Using the deployment script (Recommended)

```bash
./deploy.sh
```

### Option 2: Manual deployment

```bash
# Build and start the application
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Configuration

The application will be available at `http://localhost:3000` by default.

### Environment Variables

You can customize the deployment by creating a `.env` file:

```env
NODE_ENV=production
PORT=3000
```

## Docker Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild the application
```bash
docker-compose up --build -d
```

### Check container status
```bash
docker-compose ps
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Set up proper environment variables for your production environment
2. **Reverse Proxy**: Use nginx or another reverse proxy for SSL termination and load balancing
3. **Database**: Configure your backend API endpoints
4. **Monitoring**: Set up monitoring and logging

### Example production docker-compose.yml

```yaml
version: '3.8'

services:
  ticktrax-app:
    build: .
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=https://your-api-domain.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ticktrax-app
```

## Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs ticktrax-app

# Check if port is already in use
netstat -tulpn | grep :3000
```

### Build fails
```bash
# Clean up and rebuild
docker-compose down
docker system prune -f
docker-compose up --build -d
```

### Permission issues
```bash
# Make sure the deploy script is executable
chmod +x deploy.sh
```

## Mobile Development

**Note**: This Docker deployment excludes mobile components for web-only deployment. For mobile development, use the regular development setup with Cordova.

## Support

For issues related to Docker deployment, check the logs first:

```bash
docker-compose logs -f
```

For application-specific issues, refer to the main README.md file.
