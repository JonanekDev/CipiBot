FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .

ARG APP_NAME
RUN turbo prune --scope=@cipibot/$APP_NAME --docker

FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# TODO: Install only production dependencies - problem - prisma migrate deploy...
RUN pnpm install --frozen-lockfile
RUN npm install -g turbo

COPY --from=pruner /app/out/full/ .

ARG APP_NAME
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm --filter @cipibot/$APP_NAME... run --if-present db:generate

RUN pnpm run build --filter=@cipibot/$APP_NAME...

RUN find packages -type d -name "src" -exec rm -rf {} +
RUN find packages -type f -name "*.ts" -delete

FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 cipibot
RUN adduser --system --uid 1001 cipibot

ARG APP_NAME

# Copy root dependencies
COPY --from=builder  --chown=cipibot:cipibot /app/node_modules ./node_modules
COPY --from=builder  --chown=cipibot:cipibot /app/package.json ./package.json
COPY --from=builder  --chown=cipibot:cipibot /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy packages
COPY --from=builder --chown=cipibot:cipibot /app/packages ./packages

# Copy the specific app
COPY --from=builder  --chown=cipibot:cipibot /app/apps/${APP_NAME}/dist ./apps/${APP_NAME}/dist
COPY --from=builder  --chown=cipibot:cipibot /app/apps/${APP_NAME}/node_modules ./apps/${APP_NAME}/node_modules
COPY --from=builder  --chown=cipibot:cipibot /app/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/package.json
# Copy prisma  - little hack to not get error about missing prisma folder
COPY --from=builder --chown=cipibot:cipibot /app/apps/${APP_NAME}/prism[a] ./apps/${APP_NAME}/prisma/
USER cipibot

WORKDIR /app/apps/${APP_NAME}

CMD sh -c "npx --yes prisma migrate deploy 2>/dev/null || true && node dist/index.js"