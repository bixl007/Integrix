# syntax=docker/dockerfile:1
# Shared image for the Node services. Build with --build-arg SERVICE=api|hooks|processor|worker.
ARG NODE_VERSION=26
ARG BUN_VERSION=1.4.4
ARG PRISMA_VERSION=6.19.3

FROM oven/bun:${BUN_VERSION}-alpine AS bun

# Full workspace install; shared by every service build and the migrate job.
FROM node:${NODE_VERSION}-alpine AS deps
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# One-shot job: apply migrations and seed, then exit.
FROM deps AS migrate
WORKDIR /app/packages/database
RUN bunx prisma generate
CMD ["sh", "-c", "bunx prisma migrate deploy && bunx prisma db seed"]

FROM deps AS build
ARG SERVICE
ARG PRISMA_VERSION
RUN bunx turbo build --filter=@integrix/${SERVICE}
# Swap in production-only deps for this service (peers omitted: Prisma's CLI and TS are not needed at runtime).
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules \
  && bun install --frozen-lockfile --production --omit=peer --filter=@integrix/${SERVICE} \
  && bunx prisma@${PRISMA_VERSION} generate --schema packages/database/schema.prisma

FROM node:${NODE_VERSION}-alpine AS runner
ARG SERVICE
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
# Shared workspace packages (database, mailer): built dist + their prod deps.
COPY --from=build --chown=node:node /app/packages ./packages
COPY --from=build --chown=node:node /app/apps/${SERVICE}/package.json ./apps/${SERVICE}/
COPY --from=build --chown=node:node /app/apps/${SERVICE}/dist ./apps/${SERVICE}/dist
COPY --from=build --chown=node:node /app/apps/${SERVICE}/node_modules ./apps/${SERVICE}/node_modules
WORKDIR /app/apps/${SERVICE}
USER node
CMD ["node", "dist/index.js"]
