# Use official Node.js LTS (Long Term Support) image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set NODE_ENV to production for optimizations
ENV NODE_ENV=production

# Copy package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Run the application
CMD ["node", "server.js"]
