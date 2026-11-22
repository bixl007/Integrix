---
type: Module
title: Database package
description: The Prisma schema, migrations, seed and shared client exports.
resource: ../packages/database/
---

# @integrix/database

- `schema.prisma` defines User (unique email, optional password for OAuth-only accounts, `emailVerified`), Session and OtpCode (both store hashes only and cascade on user delete), Zap, Trigger, Action, AvailableTrigger, AvailableAction, ZapRun and ZapRunOutbox. `prisma.config.ts` sets the schema path, migrations path and seed command.
- `src/index.ts` re-exports `PrismaClient`, the model types and the JSON types (`JsonObject`, `JsonValue`). Services import from `@integrix/database`, never `@prisma/client` directly.
- Schema changes: edit `schema.prisma`, run `bunx prisma migrate dev --name <change>` from this folder with `DATABASE_URL` set, and commit the new folder in `migrations/`. Don't edit applied migrations.
- `seed.ts` upserts the built-in trigger and actions idempotently. It runs on `bun run dev` and in the Compose `migrate` job. The IDs (`webhook`, `email`, `solana`) are contracts used by the worker and web registries.
- Scripts read the root `.env` through `bun --env-file`. Verify with `bun run db:generate` and `bun run typecheck`.

## Mailer

`packages/mailer` exports `sendMail({ to, subject, text, html? })` and `isMailerConfigured()`. It reads `SMTP_*` and `FROM_EMAIL`, uses STARTTLS on 587 and TLS on 465, and logs mail to the console instead of sending when SMTP is unset outside production. The API (OTP codes) and the worker (Email action) both use it, so don't create another transport.
