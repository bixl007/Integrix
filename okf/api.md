---
type: Module
title: API service
description: Auth, zap CRUD, available triggers and actions, and response contracts.
resource: ../apps/api/
---

# Express 5 API (port `API_PORT`, default 3000)

- `src/index.ts` wires JSON parsing (100kb limit), CORS, `/health`, the routers under `/api/v1/*` and the final `errorHandler`. Express 5 forwards rejected async handlers to that handler, so routes don't need try/catch.
- `src/routes/user.ts` runs two-step auth:
  - `POST /signup` creates an unverified user. `POST /signin` checks the bcrypt password. Both email a 6-digit OTP and return `{ otpRequired, email }`.
  - `POST /verify-otp` checks the code, marks the email verified, starts a session and returns `{ user }`.
  - `POST /resend-otp` is allowed only while a code is pending, with a 60s cooldown. `POST /logout` revokes the session. `GET /` returns `{ user }`.
  - Unknown users, OAuth-only accounts and bad passwords share one error message.
- `src/services/otp.ts` stores SHA-256 hashes of codes bound to the user id. Codes last 10 minutes and allow 5 attempts. `src/services/session.ts` issues a random token in the httpOnly `integrix_session` cookie (7 days, `SameSite=Lax`, `Secure` when `API_PUBLIC_URL` is https) and stores only its hash.
- `src/routes/auth.ts`: `GET /session` returns `{ user | null }` (always 200), `GET /providers` lists configured OAuth providers, and `GET /oauth/:provider` and its `/callback` run the authorization-code flow with a state cookie for CSRF protection. A verified provider email is linked to an existing user by email and skips the OTP.
- `src/auth/`: the `OAuthProvider` interface and the Google implementation. Add a provider by implementing the interface and registering it in `index.ts`; it's enabled only when its client ID and secret env vars are set.
- `src/routes/zap.ts`: `POST /` accepts an optional `name` (same rule as rename) and returns `{ zapId }` and writes the zap, trigger and back-reference inside one `$transaction` using `tx`. `GET /` returns `{ zaps }` (newest first) and `GET /:zapId` returns `{ zap }`. `PATCH /:zapId` takes `{ name?, enabled? }` (at least one): `name` renames the zap (trimmed, at most 80 characters; an empty string clears it back to `null`) and `enabled` turns it on or off. It returns `{ zap }`. `PUT /:zapId` takes the same body as `POST /` and, in one transaction, sets the name and trigger type and replaces the zap's `Action` rows; it returns `{ zap }`. Runs already started are unaffected because they carry their own copy of the steps. `DELETE /:zapId` returns `{ ok: true }`, and the database cascades the trigger, actions, runs, run steps and outbox rows. All three return 404 `{ message }` for a zap the user doesn't own. `GET /:zapId/runs` returns `{ runs }`: the latest 20 runs, newest first, each with `id`, `status`, `createdAt`, `finishedAt` and its `steps` in stage order (`stage`, `actionId`, `status`, `error`, `output`, `startedAt`, `finishedAt`). It leaves out the request body and returns an empty list for a zap the user doesn't own. `GET /:zapId/sample` returns `{ sample }`: the latest run's request body and step outputs as `{ payload, steps: [{ stage, output }] }`, or `null` when the zap has no runs (or isn't the user's). The builder uses it to suggest fields. Every query is scoped by `req.userId` (writes use `updateMany`/`deleteMany` with the owner in `where`).
- `src/routes/trigger.ts` and `src/routes/action.ts` serve `{ availableTriggers }` and `{ availableActions }`.
- `src/routes/profile.ts` (all routes require a session):
  - `GET /` returns `{ profile: { name, email, hasPassword } }`. `PATCH /` updates the name.
  - `POST /email` emails an `email_change` code to the new address (checking it isn't taken, with a cooldown), then `POST /email/verify` swaps the address.
  - `POST /password` changes the password (or sets one for OAuth-only accounts) and revokes the user's other sessions.
  - OTP codes carry a `purpose`, so an email-change code can never complete a login.
- `src/middleware/auth.ts` resolves the session cookie and sets `req.userId` (typed in `src/types.d.ts`). CORS allows only `WEB_URL`, with credentials.
- `src/schemas` holds the zod request schemas. Action metadata is a flat string map, and a zap needs at least one action. `zapName` (trimmed, at most 80 characters, empty becomes `null`) is shared by create and rename.
- `src/config.ts` holds the public URLs, cookie and OTP settings. OTP emails go through `@integrix/mailer`, which logs them instead of sending when SMTP isn't configured outside production.
- Verify with `bun run typecheck`. With Postgres up, run `bun run dev`, then `curl localhost:3000/health` and exercise signup, signin and zap creation.
