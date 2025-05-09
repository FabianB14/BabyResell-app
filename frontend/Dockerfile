# Multi-stage build for frontend React app

# Build stage
FROM node:16-alpine as build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source and build
COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy build from previous stage
COPY --from=build /app/build ./build

# Copy server.js for serving the app
COPY server.js ./

# Production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]