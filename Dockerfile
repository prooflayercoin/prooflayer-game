FROM node:22-alpine

WORKDIR /app

# Prisma needs OpenSSL available in Alpine containers.
RUN apk add --no-cache openssl

# Install pnpm globally
RUN npm install -g pnpm

# Copy root workspace config.
COPY tsconfig.base.json package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy workspace package configs
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Copy source code and build configs required by the API.
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/config/src ./packages/config/src
COPY packages/config/tsconfig.json ./packages/config/
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig.json ./apps/api/

# Install dependencies with pnpm.
RUN pnpm install --frozen-lockfile

# Generate Prisma client and compile packages in dependency order.
RUN pnpm --filter @prooflayer/api exec prisma generate
RUN pnpm --filter @prooflayer/shared build
RUN pnpm --filter @prooflayer/config build
RUN pnpm --filter @prooflayer/api build

EXPOSE 3000

# Railway injects DATABASE_URL and PORT. API_PORT should be set to $PORT in Railway
# variables, or left as 3000 when a fixed exposed port is configured.
CMD ["pnpm", "--filter", "@prooflayer/api", "railway:start"]
