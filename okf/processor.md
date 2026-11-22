---
type: Module
title: Processor service
description: Outbox polling, back-off and Kafka publishing.
resource: ../apps/processor/
---

# Outbox processor

- On start it ensures the `zap-events` topic exists (1 partition, RF 1).
- The loop reads up to 10 `ZapRunOutbox` rows whose `availableAt` has passed (oldest first), publishes a `{ zapRunId, stage }` message for each using the row's own `stage`, then deletes those rows. Hooks writes stage 0 rows that are due at once. A row with a later `stage` or a future `availableAt` is published the same way once it is due, which is how a run can wait without blocking the worker. A crash between send and delete can re-publish, so delivery is at-least-once.
- Every 30 seconds (`SCHEDULE_CHECK_MS`) the same loop calls `startDueSchedules`: it reads up to 10 enabled zaps whose `nextRunAt` has passed and, per zap in one transaction, moves `nextRunAt` forward with `nextRunAfter` (guarded on the old value, so a firing can't start twice), then writes a `ZapRun` with `{ scheduledFor }` as its body, the step snapshot and a stage 0 outbox row. It adds no timer or process of its own.
- Polling backs off exponentially from 1s to 5s while the outbox is empty and polls again immediately after a full batch. Keep an idle back-off: it's what keeps idle CPU and database load near zero.
- `KAFKA_BROKER` defaults to `localhost:9092`. Compose uses `kafka:29092`.
- Verify by sending a webhook and watching the processor log `Published N stage(s)`. A row with a future `availableAt` must stay in the table until that time. For schedules, set a zap's `nextRunAt` to the past and watch for `Started N scheduled run(s)`.
