---
type: Module
title: Processor service
description: Outbox polling, back-off and Kafka publishing.
resource: ../apps/processor/
---

# Outbox processor

- On start it ensures the `zap-events` topic exists (1 partition, RF 1).
- The loop reads up to 10 `ZapRunOutbox` rows, publishes `{ zapRunId, stage: 0 }` messages, then deletes those rows. A crash between send and delete can re-publish, so delivery is at-least-once.
- Polling backs off exponentially from 1s to 5s while the outbox is empty and polls again immediately after a full batch. Keep an idle back-off: it's what keeps idle CPU and database load near zero.
- `KAFKA_BROKER` defaults to `localhost:9092`. Compose uses `kafka:29092`.
- Verify by sending a webhook and watching the processor log `Published N zap run(s)`.
