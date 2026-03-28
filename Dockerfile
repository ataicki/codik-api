FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache libc6-compat openssl && \
    corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm build


FROM node:24-alpine AS runner
WORKDIR /usr/src/app

RUN apk add --no-cache openssl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=base --chown=nodejs:nodejs /usr/src/app/package.json ./package.json
COPY --from=base --chown=nodejs:nodejs /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY --from=base --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=base --chown=nodejs:nodejs /usr/src/app/prisma ./prisma
COPY --from=base --chown=nodejs:nodejs /usr/src/app/generated ./generated

USER nodejs

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]