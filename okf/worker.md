---
type: Module
title: Worker service
description: Stage execution, the action registry, the template parser, and email and Solana actions.
resource: ../apps/worker/
---

# Kafka worker

- Consumes `zap-events` (group `main-worker`, manual commits). For each `{ zapRunId, stage }` it loads the run, runs the action whose `sortingOrder === stage`, publishes `stage + 1` while more actions remain, and only then commits the offset. A throwing handler is retried in place (`RETRY_DELAYS_MS`, via `src/retry.ts`, with Kafka heartbeats between attempts). If every attempt fails, the run stops: the error is logged, later stages aren't published, and the offset is committed so the single partition keeps moving. Errors outside the handler (database, Kafka) still throw for redelivery.
- `src/actions/index.ts` maps `AvailableAction.id` to an `ActionHandler(metadata, payload)`. Add an integration by writing a handler in `src/actions/<name>.ts` and registering it there, with no branching in `index.ts`. Mirror the form in the web `action-fields.ts`; the full checklist is in [connectors.md](connectors.md).
- `src/actions/email.ts` reads `email`, `subject` and `body` (all templated) and sends through `@integrix/mailer`, which creates the transport lazily, so a worker without SMTP env still runs other actions. Zaps created before the Subject field fall back to "Hello from Integrix". `src/actions/solana.ts` sends devnet SOL from `SOL_PRIVATE_KEY` (base58).
- `src/parser.ts` replaces `{path}` and `{a.b}` placeholders with payload values. Unknown or unterminated placeholders stay as-is. `src/parser.test.ts` covers it, so keep it passing (`bun test`).
- Verify with `bun test` and an end-to-end webhook run.
