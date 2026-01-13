# Stage 1: Base - Common dependencies
FROM node:22-alpine AS base

WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies (including dev dependencies for build stage)
RUN npm ci

# Stage 2: Development - Include dev tools and source code
FROM base AS development

WORKDIR /app

# Copy all source code
COPY . .

# Expose ports for dev mode
# 5173 - Vite dev server
# 3000 - Express API server
EXPOSE 5173 3000

# Default dev command (overridden by docker-compose)
CMD ["npm", "run", "dev"]

# Stage 3: Build - Compile TypeScript and build Vite
FROM base AS build

WORKDIR /app

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY content/ ./content/
COPY tsconfig*.json ./

# Build both client and server
RUN npm run build

# Verify build outputs exist
RUN ls -la client/dist && ls -la server/dist

# Stage 4: Production - Minimal runtime
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies for server
RUN npm ci --only=production --workspace=server

# Copy built artifacts from build stage
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/content ./content

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose production port
EXPOSE 3000

# Health check - verify API endpoint responds
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/content/contact', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Start production server
CMD ["npm", "run", "start"]
