# Code review guide

Review the behavior a user, webhook caller or downstream service will experience. Trace a change from its route or component through the API, database, queue and worker. Give each finding a file location, the condition that triggers it, its impact, and the smallest practical fix.

## Design

- Each module has one responsibility, and new behavior extends a registry or contract instead of adding type-switches (see [CLAUDE.md](CLAUDE.md#engineering-principles)).
- Flag duplicated logic that an existing helper already covers, along with speculative abstractions, unused options and dead code.
- Comments are one or two lines and explain why. Flag paragraph comments and comments that restate the code.

## TypeScript

- Strict mode stays on. Narrow `unknown` errors and external JSON before use. A type assertion doesn't validate a request body.
- No `any`, `@ts-ignore` or `!` without a short justification. Use type-only imports for types.
- Naming: PascalCase for components and types, camelCase for values, a `use` prefix for hooks, and names that describe the data or action.

## API and services

- Protected routes run `authMiddleware` and scope every query by `req.userId`. Validate bodies with zod before persistence.
- Preserve response shapes (`{ zaps }`, `{ zap }`, `{ user }`, `{ otpRequired, email }`, `{ message }`) because the web app depends on them.
- Auth stays cookie-based: never return session tokens in JSON or store them in `localStorage`. Keep OTP codes and session tokens hashed at rest.
- Multi-row writes use the transaction client (`tx`), not the global client. The hooks → outbox write must stay atomic.
- Worker and processor changes keep at-least-once delivery: commit the Kafka offset only after the stage succeeds, and keep handlers idempotent where possible.
- Keep secrets, tokens and payload contents out of logs and error responses.

## Web

- Use design tokens and `components/ui` primitives. Check light, dark and system themes, keyboard navigation, focus rings and screen-reader labels.
- Keep pages server components unless they need client features. Avoid adding client libraries that a primitive or CSS can replace.
- Exercise loading, empty, error and success states.

## Performance and ops

- No new always-on processes, tight polling loops or unbounded queries. Check memory limits in `docker-compose.yml` when adding a service.
- Schema changes ship as a Prisma migration in `packages/database/migrations` and stay compatible with existing rows.

## Before approving

- `bun run check` and `bun run build` pass. Report any check that couldn't run.
- The diff has no unrelated edits, generated output, `.env` files or extra lockfiles. Dependency changes come with their `bun.lock` update.
