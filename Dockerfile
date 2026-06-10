FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all packages and apps
COPY packages ./packages
COPY apps ./apps

# Install all dependencies (including workspace deps)
RUN pnpm install --frozen-lockfile

# Build API
RUN pnpm --filter @prooflayer/api build

EXPOSE 3000

CMD ["pnpm", "--filter", "@prooflayer/api", "start"]
