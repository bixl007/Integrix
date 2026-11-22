---
okf_version: '0.2'
---

# Integrix knowledge bundle

Choose the guide for the source area you're changing. Start with [ARCHITECTURE.md](../ARCHITECTURE.md) for how the services fit together. Paths in each guide are relative to its source directory unless they name another area. Run Bun commands from the repository root.

- [Web routes and layouts](web-app.md): `apps/web/app/`. Route groups, the root layout, the auth guard, the landing, `/docs`, zap, usage and settings pages, and page data flow.
- [Design system](design-system.md): `apps/web/components/ui/`, `apps/web/app/globals.css`. Tokens, primitives, themes and icons.
- [Web features and helpers](web-features.md): `apps/web/components/`, `apps/web/lib/`, `apps/web/hooks/`. Header and footer, auth form, zap builder, run history, connector registries, templates, connections, API client and auth store.
- [Connectors](connectors.md): spans `packages/database`, `apps/worker`, `apps/hooks` and `apps/web`. The checklists for adding a trigger, an action or a per-user credential, and the path to user-configurable connectors.
- [API service](api.md): `apps/api/`. Auth, zaps (create, edit, on/off, run history, replay), secret masking, connections, usage and response contracts.
- [Hooks service](hooks.md): `apps/hooks/`. The public webhook endpoint: owner and signature checks, the step snapshot and the transactional outbox write.
- [Processor service](processor.md): `apps/processor/`. Outbox polling, back-off, Kafka publishing of due stages and starting scheduled runs.
- [Worker service](worker.md): `apps/worker/`. Stage execution and step recording, the action registry and its handlers, the template parser, the guarded HTTP client and connections.
- [Mailer package](database.md#mailer): `packages/mailer/`. The server's SMTP sending (OTP, run alerts, Email steps) and sending from a user's Gmail connection.
- [Database package](database.md): `packages/database/`. The Prisma schema, migrations, built-in catalog, seed, shared client exports and the run, schedule and encryption helpers.
- [Tooling and infrastructure](tooling.md): root configs, `packages/tsconfig/`, `docker/`, `.github/`. Bun, Turbo, linting, hooks, Docker and CI.
