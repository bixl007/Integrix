---
type: Module
title: Hooks service
description: The public webhook endpoint and the transactional outbox write.
resource: ../apps/hooks/
---

# Webhook receiver (port `HOOKS_PORT`, default 3002)

- `POST /hooks/catch/:userId/:zapId` loads the zap first: an unknown id, or a zap whose trigger isn't `webhook`, answers 404 `{ message }` and a zap with `enabled: false` answers 403, and neither records anything. Otherwise it stores the JSON body as `ZapRun.metadata`, copies the zap's steps to `ZapRun.actions` with `snapshotActions` (so a later edit can't change this run) and creates its `ZapRunOutbox` row in the same transaction. The run starts as `queued` and the outbox row defaults to stage 0, due immediately. That atomic write is the outbox pattern's guarantee, so keep it.
- The endpoint is public and unauthenticated. The body limit is 100kb. `GET /health` serves liveness probes.
- Keep the handler fast: no external calls. Downstream work belongs in the worker.
- Verify by POSTing to a real zap's URL and confirming a `ZapRun` row appears (`bun run db:studio`), then turn the zap off and confirm the same request gets a 403.
