---
type: Module
title: Hooks service
description: The public webhook endpoint: owner and signature checks, the step snapshot and the transactional outbox write.
resource: ../apps/hooks/
---

# Webhook receiver (port `HOOKS_PORT`, default 3002)

- `POST /hooks/catch/:userId/:zapId` loads the zap first: an unknown id, or a zap whose trigger isn't `webhook`, answers 404 `{ message }` and a zap with `enabled: false` answers 403, and neither records anything. Otherwise it stores the JSON body as `ZapRun.metadata`, copies the zap's steps to `ZapRun.actions` with `snapshotActions` (so a later edit can't change this run) and creates its `ZapRunOutbox` row in the same transaction. The run starts as `queued` and the outbox row defaults to stage 0, due immediately. That atomic write is the outbox pattern's guarantee, so keep it.
- The endpoint is public. The `:userId` in the URL must be the zap owner's id, otherwise it answers 404 like an unknown zap. When the trigger's metadata has a `secret`, `verifyWebhook` in `src/signatures.ts` must pass or the request gets a 401; without a secret every request is accepted, which keeps older URLs working. `verifiers` is a registry keyed by the trigger's `sender` setting (`generic`, `github`, `stripe`, `shopify`, `typeform`, `calendly`, `calcom`, `helius`; an unknown id uses `generic`), built from three small checks: an HMAC of the raw body in a header, a timestamped `t=,v1=` header with a replay window, and a header that equals the secret. `signatures.test.ts` covers each sender. `express.json`'s `verify` hook keeps the raw bytes on `req.rawBody`, because a signature over re-serialized JSON would not match. Add a sender by adding a verifier here and a preset in the web `webhook-senders.ts`.
- The body limit is 100kb. `GET /health` serves liveness probes.
- Keep the handler fast: no external calls. Downstream work belongs in the worker.
- Verify by POSTing to a real zap's URL and confirming a `ZapRun` row appears (`bun run db:studio`), then turn the zap off and confirm the same request gets a 403.
