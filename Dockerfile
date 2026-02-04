# ========================================
# Stage 1: Dependencies (all)
# ========================================
FROM node:22-alpine AS deps

WORKDIR /app

# Install dependencies needed for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# ========================================
# Stage 2: Production Dependencies Only
# ========================================
FROM node:22-alpine AS prod-deps

WORKDIR /app

# Install dependencies needed for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install only production dependencies (ignore prepare script for husky)
RUN npm ci --omit=dev --ignore-scripts

# ========================================
# Stage 3: Builder
# ========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy all dependencies from deps stage (needed for build)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# ========================================
# Stage 4: Production Runner
# ========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=nestjs:nestjs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# Start the application
CMD ["node", "dist/main"]
