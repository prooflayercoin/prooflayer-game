FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all workspaces
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter @prooflayer/shared build
RUN pnpm --filter @prooflayer/config build

# Build API
WORKDIR /app/apps/api
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
