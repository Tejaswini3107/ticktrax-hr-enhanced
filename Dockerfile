# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code (excluding mobile and build directories)
COPY . .

# Remove mobile-related files and directories
RUN rm -rf mobile/ www/ build/ src/components/mobile/ src/config/mobile.js src/services/mobileService.js src/services/cordovaService.js

# Remove unnecessary files
RUN rm -f src/services/apiService_old.js src/utils/apiTest.js npm-run-dev.log

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "preview"]
