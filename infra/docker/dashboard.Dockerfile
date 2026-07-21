FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.0.0 --activate

FROM base AS builder
WORKDIR /repo
COPY . .
ENV CI=true
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tpmr/dashboard build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/dashboard/.next ./.next
COPY --from=builder /repo/apps/dashboard/public ./public
COPY --from=builder /repo/apps/dashboard/package.json ./package.json
COPY --from=builder /repo/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]
