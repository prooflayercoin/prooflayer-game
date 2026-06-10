FROM node:22-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy root config files (only files that exist)
COPY tsconfig.base.json package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy workspace package configs
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Copy all source code and configs
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/config/src ./packages/config/src
COPY packages/config/tsconfig.json ./packages/config/
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Build the API
RUN pnpm --filter @prooflayer/api build

# Expose port
EXPOSE 3000

# Start the API
CMD ["node", "apps/api/dist/index.js"]
