# ==============================================================================
# SWEETY — Production Multi-Stage Dockerfile (Single-Service Deployment)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies across monorepo
RUN npm install

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Generate Prisma Client & Build Vite Frontend into client/dist
RUN npm run build

# ==============================================================================
# Production Runner
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm install --omit=dev

# Copy built frontend assets and server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

CMD ["npm", "run", "start"]

