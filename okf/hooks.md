---
type: Module
title: Hooks service
description: The public webhook endpoint and the transactional outbox write.
resource: ../apps/hooks/
---

# Webhook receiver (port `HOOKS_PORT`, default 3002)

- `POST /hooks/catch/:userId/:zapId` stores the JSON body as `ZapRun.metadata` and creates its `ZapRunOutbox` row in the same transaction. That atomic write is the outbox pattern's guarantee, so keep it.
- The endpoint is public and unauthenticated. The body limit is 100kb. `GET /health` serves liveness probes.
- Keep the handler fast: no external calls. Downstream work belongs in the worker.
- Verify by POSTing to a real zap's URL and confirming a `ZapRun` row appears (`bun run db:studio`).
