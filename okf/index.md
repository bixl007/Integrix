---
okf_version: '0.2'
---

# Integrix knowledge bundle

Choose the guide for the source area you're changing. Paths in each guide are relative to its source directory unless they name another area. Run Bun commands from the repository root.

- [Web routes and layouts](web-app.md): `apps/web/app/`. Route groups, the root layout, the auth guard and page data flow.
- [Design system](design-system.md): `apps/web/components/ui/`, `apps/web/app/globals.css`. Tokens, primitives, themes and icons.
- [Web features and helpers](web-features.md): `apps/web/components/`, `apps/web/lib/`, `apps/web/hooks/`. Header and footer, auth form, zap builder, API client and auth store.
- [API service](api.md): `apps/api/`. Auth, zap CRUD, available triggers and actions, and response contracts.
- [Hooks service](hooks.md): `apps/hooks/`. The public webhook endpoint and the transactional outbox write.
- [Processor service](processor.md): `apps/processor/`. Outbox polling, back-off and Kafka publishing.
- [Worker service](worker.md): `apps/worker/`. Stage execution, the action registry, the template parser, and email and Solana actions.
- [Mailer package](database.md#mailer): `packages/mailer/`. Shared SMTP sending for OTP emails and Email actions.
- [Database package](database.md): `packages/database/`. The Prisma schema, migrations, seed and shared client exports.
- [Tooling and infrastructure](tooling.md): root configs, `packages/tsconfig/`, `docker/`, `.github/`. Bun, Turbo, linting, hooks, Docker and CI.
