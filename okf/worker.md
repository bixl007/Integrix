---
type: Module
title: Worker service
description: Stage execution, the action registry, the template parser, and email and Solana actions.
resource: ../apps/worker/
---

# Kafka worker

- Consumes `zap-events` (group `main-worker`, manual commits). For each `{ zapRunId, stage }`, `handleStage` in `src/index.ts` loads the run and runs the step at index `stage` of `ZapRun.actions`, the copy of the zap's steps taken at intake (`readRunActions`). A run without a copy falls back to the zap's current actions through `snapshotActions`. It then writes the step's `ZapRunStep` row (an upsert on run and stage) and the run's `status` and `finishedAt` in one transaction, publishes `stage + 1` straight to Kafka while the run is still `running`, and only then is the offset committed. Errors outside the handler (database, Kafka) still throw for redelivery.
- `src/stage.ts` holds the step logic, covered by `stage.test.ts`. `runStep` retries a throwing handler in place (`RETRY_DELAYS_MS`, via `src/retry.ts`, with Kafka heartbeats between attempts) and returns `success`, `halted` (the handler returned `halt`), `failed` (every attempt threw; the error is capped at 500 characters) or `skipped` (no handler registered). `runStatusAfter` maps that to the run: `failed` and `halted` end it, and a passed or skipped step gives `running` or, on the last stage, `success`.
- A failed run emails the zap's owner through `@integrix/mailer`. `src/notify.ts` builds the message with a link to `WEB_URL/zap/<id>?tab=history` (`notify.test.ts`). Sending is best effort: an error is logged and the stage isn't redelivered. A halted run sends nothing.
- A redelivered stage whose step is already `success` skips the handler and only re-publishes the next stage, so a crash between the database write and the commit doesn't repeat an email or a transfer.
- `src/actions/index.ts` maps `AvailableAction.id` to an `ActionHandler(metadata, payload)`. A handler throws to fail its step and may return `{ output?, halt? }` (`src/actions/types.ts`): `output` is stored on the step, and `halt` ends the run without an error. Returning nothing is fine. Add an integration by writing a handler in `src/actions/<name>.ts` and registering it there, with no branching in `index.ts`. Mirror the form in the web `action-fields.ts`; the full checklist is in [connectors.md](connectors.md).
- `src/actions/email.ts` reads `email`, `subject` and `body` (all templated) and sends through `@integrix/mailer` and returns `{ to, subject }` as its output, which creates the transport lazily, so a worker without SMTP env still runs other actions. Zaps created before the Subject field fall back to "Hello from Integrix". `src/actions/solana.ts` sends devnet SOL from `SOL_PRIVATE_KEY` (base58) and returns the transaction `signature` as its output.
- `src/context.ts` builds what templates read (`context.test.ts`): the request body plus `steps.<N>`, the output of each earlier step that succeeded, where N is the UI step number (stage + 2). `handleStage` passes it to the handler as `payload`.
- `src/actions/filter.ts` compares `field` with `value` through the `filterOperators` registry (keyed by the `operator` setting, mirrored by the select options in the web `action-fields.ts`) and returns `{ halt: true }` when the condition fails. An unknown operator throws. `filter.test.ts` covers it.
- `src/parser.ts` replaces `{path}` and `{a.b}` placeholders with context values. Unknown or unterminated placeholders stay as-is, unless the caller passes a `missing` replacement (Filter passes an empty string, which also replaces `null`). `src/parser.test.ts` covers it, so keep it passing (`bun test`).
- Verify with `bun test` and an end-to-end webhook run, then check the run's `ZapRunStep` rows or the zap's History tab.
