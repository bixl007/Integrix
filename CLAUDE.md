# Integrix

Integrix is a webhook-driven workflow automation platform (Zapier-style) in a Bun + Turborepo monorepo. Start with the [review conventions](REVIEW.md), then use the [OKF index](okf/index.md) to choose the guides for the source areas you touch. When a change spans modules, read each relevant guide, and update a guide when its documented contract changes. Record notable doc changes in [okf/log.md](okf/log.md).

The [README](README.md) covers environment setup, scripts, ports and Docker.

## How a run flows

`web` → `api` creates a zap. An HTTP POST to `hooks` writes a `ZapRun` plus a `ZapRunOutbox` row in one transaction. `processor` drains the outbox into the Kafka topic `zap-events` (stage 0). `worker` runs that stage's action, then publishes stage + 1 until the last action. All services share `packages/database` (Prisma).

## Development

- Use Bun 1.4+ for installs and scripts and Node 26 (`.nvmrc`) as the runtime. Keep the single root `bun.lock`; never add npm, yarn or pnpm lockfiles.
- Add dependencies to the workspace that imports them: `bun add <pkg> --cwd apps/<name>`. Put types and build tools in `devDependencies`.
- Before finishing a change, run `bun run check` (lint, format check, typecheck, tests) and `bun run build`. The pre-commit hook runs ESLint and Prettier on staged files.
- Keep secrets in the root `.env` (template: `.env.example`). Never commit `.env` or print secrets in logs or responses.

## Engineering principles

Design with low-level-design discipline and SOLID, scaled to the size of the change:

- **Single responsibility**: a module does one job. Routes validate and respond, Prisma calls stay in the service that owns them, and UI primitives hold no business logic.
- **Open/closed**: extend through registries, not branching. New worker actions go in `apps/worker/src/actions/index.ts` and new action forms in `apps/web/components/zap/action-fields.ts`. Don't add `if (type === ...)` chains.
- **Liskov substitution**: implementations of a shared contract (`ActionHandler`, UI primitive props) must be swappable without callers checking which one they got.
- **Interface segregation**: keep props and function signatures minimal. Pass the data a unit needs, not whole objects "just in case".
- **Dependency inversion**: depend on the shared contract (`ActionHandler`, `api()` client, design tokens), not on concrete details such as raw `fetch`, hard-coded URLs or literal colors.
- Prefer composition over inheritance and pure functions over stateful classes. Reuse an existing helper or component before adding a new one. Don't add abstractions, options or config nobody uses yet.
- Validate untrusted input at the boundary (zod in the API; type-narrow parsed JSON). Keep `strict` TypeScript and avoid `any`, `@ts-ignore` and non-null assertions without a reason.

## Comments

- Write short comments: one or two lines that explain _why_, a constraint, or a non-obvious contract. Never write paragraph comments.
- Don't restate what the code says. Prefer a clearer name over a comment.
- Use a one-line `/** ... */` on exported functions and components when their purpose isn't obvious from the name.
- Mark a known limitation as `// shortcut: <limit>, <when to revisit>`.

## Conventions

- File names: kebab-case in `apps/web` (`zap-card.tsx`) and camelCase or kebab-case in services, following the folder. Components and types use PascalCase; hooks start with `use`.
- Web imports use the `@/` alias. UI must use the design-system tokens and primitives in `apps/web/components/ui` (see [design system](okf/design-system.md)). Never use raw hex colors in components.
- Server components by default; add `'use client'` only for state, effects, browser APIs or handlers.
- Keep resource use low: no new always-on processes, polling loops without back-off, or heavy client libraries where CSS or the platform suffices.
