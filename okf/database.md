---
type: Module
title: Database package
description: The Prisma schema, migrations, seed and shared client exports.
resource: ../packages/database/
---

# @integrix/database

- `schema.prisma` defines User (unique email, optional password for OAuth-only accounts, `emailVerified`), Session and OtpCode (both store hashes only and cascade on user delete), Zap (optional `name`; `null` means the UI shows the step chain), Trigger, Action, AvailableTrigger, AvailableAction, ZapRun, ZapRunStep and ZapRunOutbox. Deleting a Zap cascades to its Trigger, Actions and ZapRuns, and from runs to ZapRunStep and ZapRunOutbox. `prisma.config.ts` sets the schema path, migrations path and seed command.
- Run tracking (migration `run_history`): `ZapRun.status` is a string (`queued` by default, then `running`, `success`, `failed` or `halted`, written by the worker; `unknown` for runs older than the migration) with `createdAt` and `finishedAt`. `ZapRunStep` has one row per run and stage (unique together) holding the connector id as text, a status, `error`, `output` and timings. `ZapRunOutbox` rows carry the `stage` to publish and an `availableAt` time; both default to "stage 0, now", so hooks is unchanged.
- `src/index.ts` re-exports `PrismaClient`, the model types and the JSON types (`JsonObject`, `JsonValue`). Services import from `@integrix/database`, never `@prisma/client` directly.
- Schema changes: edit `schema.prisma`, run `bunx prisma migrate dev --name <change>` from this folder with `DATABASE_URL` set, and commit the new folder in `migrations/`. Don't edit applied migrations.
- `seed.ts` upserts the built-in trigger and actions idempotently. It runs on `bun run dev` and in the Compose `migrate` job. The IDs (`webhook`, `email`, `solana`) are contracts used by the worker and web registries.
- Scripts read the root `.env` through `bun --env-file`. Verify with `bun run db:generate` and `bun run typecheck`.

## Mailer

`packages/mailer` exports `sendMail({ to, subject, text, html? })` and `isMailerConfigured()`. `sendMail` collapses the subject to one line (`formatSubject`) and, unless `html` is passed, sends an HTML version built by `textToHtml` (`src/format.ts`): blank lines become paragraphs, newlines become `<br>`, and everything is escaped. `format.test.ts` covers it. It reads `SMTP_*` and `FROM_EMAIL`, uses STARTTLS on 587 and TLS on 465, gives up on a connection, greeting or idle socket after 10 seconds (so a stuck SMTP server can't hold up the worker's queue), and logs mail to the console instead of sending when SMTP is unset outside production. The API (OTP codes) and the worker (Email action and run-failure emails) both use it, so don't create another transport.
