FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm i

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

FROM base AS build

WORKDIR /app

COPY client/ ./client/
COPY server/ ./server/
COPY content/ ./content/
COPY tsconfig*.json ./

RUN npm run build

RUN ls -la client/dist && ls -la server/dist

FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm ci --workspace=server

# Copy built artifacts from build stage
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/content ./content

# Start production server
CMD ["npm", "run", "start"]
