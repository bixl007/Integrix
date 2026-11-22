import { nextRunAfter, PrismaClient, snapshotActions } from '@integrix/database';
import { Kafka, Partitioners } from 'kafkajs';

const TOPIC_NAME = 'zap-events';
const BATCH_SIZE = 10;
// Idle polls back off to this ceiling so an empty outbox costs almost nothing.
const MIN_POLL_MS = 1_000;
const MAX_POLL_MS = 5_000;
// Schedules are hourly at the finest, so they are checked far less often than the outbox.
const SCHEDULE_CHECK_MS = 30_000;

const client = new PrismaClient();
const kafka = new Kafka({
  clientId: 'outbox-processor',
  brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureTopic() {
  const admin = kafka.admin();
  await admin.connect();
  const topics = await admin.listTopics();
  if (!topics.includes(TOPIC_NAME)) {
    await admin.createTopics({
      topics: [{ topic: TOPIC_NAME, numPartitions: 1, replicationFactor: 1 }],
    });
    console.log(`Created topic ${TOPIC_NAME}`);
  }
  await admin.disconnect();
}

/** Publishes one batch of due outbox rows, each at its own stage; returns how many were sent. */
async function drainOutbox(producer: ReturnType<typeof kafka.producer>) {
  const rows = await client.zapRunOutbox.findMany({
    where: { availableAt: { lte: new Date() } },
    orderBy: { availableAt: 'asc' },
    take: BATCH_SIZE,
  });
  if (rows.length === 0) return 0;

  await producer.send({
    topic: TOPIC_NAME,
    messages: rows.map((r) => ({
      value: JSON.stringify({ zapRunId: r.zapRunId, stage: r.stage }),
    })),
  });
  await client.zapRunOutbox.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  console.log(`Published ${rows.length} stage(s)`);
  return rows.length;
}

/** Starts a run for every scheduled zap that is due and moves each zap to its next firing. */
async function startDueSchedules() {
  const now = new Date();
  const zaps = await client.zap.findMany({
    where: { enabled: true, nextRunAt: { lte: now } },
    include: { trigger: true, actions: { include: { type: true } } },
    take: BATCH_SIZE,
  });
  for (const zap of zaps) {
    const due = zap.nextRunAt;
    if (!due) continue;
    await client.$transaction(async (tx) => {
      // Claiming the firing first means a retry or a second processor can't start it twice.
      const { count } = await tx.zap.updateMany({
        where: { id: zap.id, nextRunAt: due },
        data: { nextRunAt: nextRunAfter(zap.trigger?.metadata, due, now) },
      });
      if (count === 0) return;
      const run = await tx.zapRun.create({
        data: {
          zapId: zap.id,
          metadata: { scheduledFor: due.toISOString() },
          actions: snapshotActions(zap.actions),
        },
      });
      await tx.zapRunOutbox.create({ data: { zapRunId: run.id } });
    });
  }
  if (zaps.length > 0) console.log(`Started ${zaps.length} scheduled run(s)`);
}

async function main() {
  await ensureTopic();
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  await producer.connect();

  let delay = MIN_POLL_MS;
  let nextScheduleCheck = 0;
  while (true) {
    try {
      if (Date.now() >= nextScheduleCheck) {
        await startDueSchedules();
        nextScheduleCheck = Date.now() + SCHEDULE_CHECK_MS;
      }
      const sent = await drainOutbox(producer);
      delay = sent > 0 ? 0 : Math.min(Math.max(delay * 2, MIN_POLL_MS), MAX_POLL_MS);
    } catch (e) {
      console.error('Error processing outbox:', e);
      delay = MAX_POLL_MS;
    }
    await sleep(delay);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
