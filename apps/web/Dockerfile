FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .

RUN turbo prune --scope=@cipibot/web --docker

FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile
RUN npm install -g turbo

COPY --from=pruner /app/out/full/ .

RUN pnpm run build --filter=@cipibot/web...

FROM nginx:alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/web/dist/ /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=2s \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]