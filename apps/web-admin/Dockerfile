FROM node:22-bookworm-slim AS builder
SHELL ["/bin/bash", "-lc"]
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and all package.json files first (for cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json .npmrc ./
COPY apps/web-admin/package.json apps/web-admin/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/

    # Install only web-admin + its workspace deps (linux-x64 platform only)
    RUN printf 'supportedArchitectures[os]=linux\nsupportedArchitectures[cpu]=x64\n' >> .npmrc && \
        pnpm install --frozen-lockfile --ignore-scripts --filter @ths-thm/web-admin --filter @ths-thm/shared --filter @ths-thm/ui

# Copy full source
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

    # Remove other workspace packages so pnpm build doesn't try to resolve their deps
    RUN rm -rf apps/api apps/mobile packages/templates

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

CMD ["node", "apps/web-admin/server.js"]
