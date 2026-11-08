# ==============================================================================
# SWEETY — Production Multi-Stage Dockerfile (Single-Service Deployment)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Copy full source trees so Prisma schema and React code are present
COPY server/ ./server/
COPY client/ ./client/

# Install dependencies and build client + generate Prisma
RUN npm install
RUN npm run build

# ==============================================================================
# Production Runner Stage
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy root manifests
COPY --from=builder /app/package*.json ./

# Copy built node_modules and Prisma binaries from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server

EXPOSE 5000

CMD ["node", "server/src/server.js"]
