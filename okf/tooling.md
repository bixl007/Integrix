---
type: Module
title: Tooling and infrastructure
description: Bun, Turbo, linting, hooks, Docker and CI.
resource: ../
---

# Repository tooling

- **Runtime and package manager**: Node 26 (`.nvmrc`, `engines`) and Bun 1.4 (`packageManager`). Bun uses isolated installs, so each workspace has its own `node_modules` symlinks into `node_modules/.bun`.
- **Turbo** (`turbo.json`): `build` and `typecheck` depend on upstream builds and `db:generate`. `dev` builds dependencies first, then runs each app's `dev`. Services use `bun --watch` with the root `.env`; web uses `next dev --turbopack` on port 3001.
- **TypeScript**: `packages/tsconfig` provides `base.json`, `node.json` (CommonJS, `${configDir}` paths, tests excluded from emit) and `nextjs.json`.
- **Lint and format**: one flat `eslint.config.mjs` at the root (typescript-eslint, with Next and react-hooks rules scoped to `apps/web`) and Prettier with the Tailwind plugin (`.prettierrc.json`). Husky's `pre-commit` runs lint-staged.
- **Tests**: `bun test` discovers `*.test.ts` files.
- **Docker**: `docker/service.Dockerfile` builds any service (`SERVICE` build arg) into a production-only, non-root Node 26 image, and its `migrate` target runs migrations and seed once. `docker/web.Dockerfile` ships the Next standalone server.
- **Compose**: `docker-compose.yml` runs single-node KRaft Kafka (no Zookeeper, 256MB heap), a tuned Postgres, Prisma pools capped at 3, log rotation and per-container memory limits. Keep those limits when adding services.
- **CI** (`.github/workflows/ci.yml`): install, lint, format check, typecheck, test and build on every PR.
