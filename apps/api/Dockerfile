FROM node:22-alpine AS builder

RUN npm i -g pnpm@10

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/templates/package.json packages/templates/

RUN pnpm install --frozen-lockfile --filter @ths-thm/api --filter @ths-thm/shared --filter @ths-thm/templates

COPY . .

RUN pnpm --filter @ths-thm/shared build
RUN pnpm --filter @ths-thm/templates build
RUN pnpm --filter @ths-thm/api run prisma:generate
RUN pnpm --filter @ths-thm/api build

FROM node:22-alpine AS runner

RUN npm i -g pnpm@10

WORKDIR /app

RUN apk add --no-cache chromium nss freetype freetype-dev harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy built workspace packages (dist and metadata)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/templates/dist ./packages/templates/dist
COPY --from=builder /app/packages/templates/package.json ./packages/templates/package.json

COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
