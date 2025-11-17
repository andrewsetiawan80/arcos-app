FROM node:20-alpine

WORKDIR /app

# Install tsx for running migrations/seeds
RUN npm install -g tsx

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev deps for tsx and typescript)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript (if dist doesn't exist, build it)
# If dist is already copied, this will be skipped
RUN if [ ! -d "dist" ]; then npm run build; fi

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server (migrations run in docker-compose command)
CMD ["node", "dist/index.js"]
