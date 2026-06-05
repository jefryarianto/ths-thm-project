FROM node:22-alpine AS builder

RUN npm i -g pnpm@10

WORKDIR /app

# Copy workspace config and all package.json files first (for cache)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json .npmrc ./
COPY apps/web-admin/package.json apps/web-admin/
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy full source
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build - Next.js standalone output bundles everything needed
RUN cd apps/web-admin && node ../../node_modules/next/dist/bin/next build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Standalone server: Next.js puts server.js at the root of .next/standalone/
# So after COPY, /app/server.js is the entry point
COPY --from=builder /app/apps/web-admin/.next/standalone ./

# Static assets must be at the app's .next/static path (Next.js serves from here)
COPY --from=builder /app/apps/web-admin/.next/static ./apps/web-admin/.next/static

# Public folder must be at the app's public path
COPY --from=builder /app/apps/web-admin/public ./apps/web-admin/public

EXPOSE 3000

# In a monorepo, Next.js standalone places server.js at the workspace path
CMD ["node", "apps/web-admin/server.js"]
