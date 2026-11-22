# Integrix knowledge bundle updates

## 2026-11-22 (connections)

- Users can save their own Gmail account and Solana wallet as connections (`Connection` table, `AvailableAction.connectionFields`, migration `connections`), encrypted with the new `CONNECTION_SECRET`. Added `/api/v1/connection`, the Connections card in Settings, a Send from / Pay from select on Email and Solana steps, and an optional `{ connection }` third argument to `ActionHandler`. Steps without a connection keep using the server account. `sendMail` takes an optional Gmail account.

## 2026-11-22 (webhook security, sender presets, usage)

- Hooks now checks that the URL's user id is the zap owner's and, when the webhook trigger has a `secret`, verifies the sender's signature over the raw body (`src/signatures.ts`: generic, GitHub, Stripe, Shopify, Typeform, Calendly, Cal.com, Helius). Trigger secrets are masked through `AvailableTrigger.secretFields` (migration `trigger_secret_fields`). Added the `webhook-senders.ts` presets with example payloads, a "Webhook senders" docs section, array positions in templates (`{0.signature}`), `GET /api/v1/usage` and the Usage page.

## 2026-11-22 (HTTP, Slack, Discord, Telegram)

- Added the `http`, `slack`, `discord` and `telegram` connectors with one sample template each, and the worker's guarded HTTP client (`src/http.ts`: no internal addresses, no redirects, 10 second limit). Action fields can be `secret`: `AvailableAction.secretFields` (migration `action_secret_fields`) drives masking in API responses and restoring on edit. The built-in catalog moved to `packages/database/src/catalog.ts`. Solana confirmation is now limited to 10 seconds and its output is `{ signature, confirmed }`. The builder blocks saving while a required setting is empty.

## 2026-11-22 (delay, schedule, replay)

- Added the `delay` action (handlers may return `delayMs`; the worker parks the next stage in the outbox and the run shows as `waiting`) and the `schedule` trigger (`Trigger.metadata`, `Zap.nextRunAt`, migration `delay_schedule`; the processor starts due runs inside its existing loop). Hooks now accepts only webhook-triggered zaps. Added `POST /api/v1/zap/:zapId/runs/:runId/replay` and the Replay button, trigger settings in the builder, and the `trigger-panels.tsx` registries.

## 2026-11-22 (filter, step outputs, field picker)

- Added the `filter` connector (seed, worker `filterOperators` registry, form with a select, catalog, icon, a sample template). Templates can read earlier step outputs as `{steps.N.field}` through the worker's new template context, and Email now returns `{ to, subject }`. Added `GET /api/v1/zap/:zapId/sample`, the field suggestions in the step dialog (`field-paths.ts`), the `Select` primitive, and `options`/`optional` on action fields.

## 2026-11-22 (on/off and edit)

- Zaps can be turned off (`Zap.enabled`, `PATCH { enabled }`, the `Switch` primitive and `ZapToggle`) and edited (`PUT /api/v1/zap/:zapId`, `/zap/[id]/edit`, the shared `ZapBuilder`). Hooks now answers 404 for an unknown zap and 403 for one that is off. Each run carries a copy of its steps (`ZapRun.actions`, migration `zap_enabled_run_snapshot`), which the worker runs instead of the zap's current actions. A zap now needs at least one action.

## 2026-11-22 (run history)

- Runs now have a status and a step log (migration `run_history`: `ZapRun.status`/`createdAt`/`finishedAt`, the `ZapRunStep` table, and `stage` and `availableAt` on `ZapRunOutbox`). The processor publishes due outbox rows at their own stage. `ActionHandler` may return `{ output?, halt? }`, the worker records every step, skips a redelivered stage that already passed and emails the zap's owner when a run fails. Added `GET /api/v1/zap/:zapId/runs`, the History tab on the zap page, the `Tabs` primitive and 10-second SMTP timeouts in the mailer. The worker now reads `WEB_URL`.

## 2026-11-22 (worker retries)

- A failing action now retries in place (1 s, 5 s, 10 s) and then stops its run instead of being redelivered forever, so one bad step can no longer block the queue.

## 2026-11-22 (email structure)

- The Email action has a templated Subject field, and the mailer now sends a structured HTML version of every email (paragraphs, escaped payload values) next to the plain text. Sample templates use subjects and multi-paragraph bodies. Their "send to me" fields use `OWNER_EMAIL`, which the builder replaces with the user's email.

## 2026-11-22 (zap names, curl, step details)

- Zaps can be named when created (`name` on `POST /api/v1/zap`, Name field in the builder). The zap page curl is now generated from the zap's placeholders instead of a fixed body, and clicking an action step opens its full settings. Added the `CodeBlock` primitive, and the `/docs` sidebar now highlights the section being read.

## 2026-11-22 (zap rename and delete)

- Added `Zap.name` and cascading zap deletes (migration `zap_name_cascade`), `PATCH`/`DELETE /api/v1/zap/:zapId`, the `ZapActions` menu on the dashboard and zap pages, and `useApi().reload()`.

## 2026-11-22 (docs)

- Added `ARCHITECTURE.md`, the in-app `/docs` page, sample integrations (`zap-templates.ts`, with builder prefill via `?template=`), the shared `integration-catalog.ts`, and the `connectors.md` guide. Agent files now require updating docs with every feature change.

## 2026-11-22 (profile)

- Added the Settings page and `/api/v1/profile` (name, verified email change, password change that revokes other sessions) and an OTP `purpose` column.

## 2026-11-22 (auth)

- Replaced JWT-in-localStorage with 7-day httpOnly cookie sessions, added email OTP for signup and login, Google OAuth, and the shared `@integrix/mailer` package.

## 2026-11-22 (monochrome)

- Removed the purple/pink brand gradient; the UI is monochrome again.

## 2026-11-22 (UI)

- Split chrome per route group (marketing footer only on public pages, Zapier-style sidebar in the app), added the brand gradient, menu and avatar primitives, and the Integrations page.

## 2026-11-22

- Created the bundle with guides for every app and package, and connected the root agent entry files (`CLAUDE.md`, `AGENTS.md`, `REVIEW.md`).
