# Code review guide

Review the behavior a user, webhook caller or downstream service will experience. Trace a change from its route or component through the API, database, queue and worker. Give each finding a file location, the condition that triggers it, its impact, and the smallest practical fix.

## Design

- Each module has one responsibility, and new behavior extends a registry or contract instead of adding type-switches (see [CLAUDE.md](CLAUDE.md#engineering-principles)).
- Flag duplicated logic that an existing helper already covers, along with speculative abstractions, unused options and dead code.
- Comments are one or two lines and explain why. Flag paragraph comments and comments that restate the code.
- Connector data stays id-keyed and serializable, with no per-connector branches in shared code, because connectors will become user-configurable (see [okf/connectors.md](okf/connectors.md)).

## TypeScript

- Strict mode stays on. Narrow `unknown` errors and external JSON before use. A type assertion doesn't validate a request body.
- No `any`, `@ts-ignore` or `!` without a short justification. Use type-only imports for types.
- Naming: PascalCase for components and types, camelCase for values, a `use` prefix for hooks, and names that describe the data or action.

## API and services

- Protected routes run `authMiddleware` and scope every query by `req.userId`. Validate bodies with zod before persistence.
- Preserve response shapes (`{ zaps }`, `{ zap }`, `{ user }`, `{ otpRequired, email }`, `{ message }`) because the web app depends on them.
- Auth stays cookie-based: never return session tokens in JSON or store them in `localStorage`. Keep OTP codes and session tokens hashed at rest.
- Multi-row writes use the transaction client (`tx`), not the global client. The hooks → outbox write must stay atomic.
- Worker and processor changes keep at-least-once delivery: commit the Kafka offset only after the stage finishes (succeeded, or failed after its bounded retries), never let one failing step block the partition, and keep handlers idempotent where possible.
- Keep secrets, tokens and payload contents out of logs and error responses.
- Credentials are never returned: zap responses go through `maskZap`, a credential setting is listed in the catalog's `secretFields`, and a per-user credential lives in a sealed `Connection` that a step references by id.
- Worker handlers reach external URLs only through `apps/worker/src/http.ts` (10 second limit, no redirects, internal addresses refused). Flag raw `fetch` in a handler.
- A handler never sleeps or blocks the partition: waiting goes through `delayMs` and the outbox.

## Web

- Use design tokens and `components/ui` primitives. Check light, dark and system themes, keyboard navigation, focus rings and screen-reader labels.
- Keep pages server components unless they need client features. Avoid adding client libraries that a primitive or CSS can replace.
- Exercise loading, empty, error and success states.

## Performance and ops

- No new always-on processes, tight polling loops or unbounded queries. Check memory limits in `docker-compose.yml` when adding a service.
- Schema changes ship as a Prisma migration in `packages/database/migrations` and stay compatible with existing rows.

## Before approving

- `bun run check` and `bun run build` pass. Report any check that couldn't run.
- Docs match the change: the affected `okf/` guide and `okf/log.md`, the `/docs` page for user-facing behavior, `ARCHITECTURE.md` for architectural changes, and the README for setup changes (see [CLAUDE.md](CLAUDE.md#documentation)).
- The diff has no unrelated edits, generated output, `.env` files or extra lockfiles. Dependency changes come with their `bun.lock` update.
