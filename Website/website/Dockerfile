# Multi-stage Dockerfile for TanStack Start application
# Can be used for both development and production

# Base stage - common dependencies
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Set NODE_ENV to development
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Use sh -c to handle the installation on startup if node_modules is missing
CMD ["sh", "-c", "if [ ! -d node_modules ] || [ -z \"$(ls -A node_modules)\" ]; then npm install; fi && npm run dev"]

# Builder stage - builds the application
FROM base AS builder

# Install all dependencies needed for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS production

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the application
CMD ["node", ".output/server/index.mjs"]
