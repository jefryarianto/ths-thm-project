FROM node:22-bookworm-slim AS builder
SHELL ["/bin/bash", "-lc"]
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and all package.json files first (for cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json .npmrc ./
COPY apps/web-admin/package.json apps/web-admin/
COPY apps/api/package.json apps/api/
COPY packages/ packages/

    # Install all workspace dependencies
    RUN pnpm config set registry https://registry.npmmirror.com && pnpm install --frozen-lockfile --ignore-scripts

# Copy full source
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

    # Build - Next.js standalone output bundles everything needed
    RUN cd apps/web-admin && pnpm build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/apps/web-admin/.next/standalone ./
COPY --from=builder /app/apps/web-admin/public ./apps/web-admin/public
COPY --from=builder /app/apps/web-admin/.next/static ./apps/web-admin/.next/static

EXPOSE 3000

CMD ["node", "server.js"]
