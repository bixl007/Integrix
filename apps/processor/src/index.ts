import { PrismaClient } from '@integrix/database';
import { Kafka, Partitioners } from 'kafkajs';

const TOPIC_NAME = 'zap-events';
const BATCH_SIZE = 10;
// Idle polls back off to this ceiling so an empty outbox costs almost nothing.
const MIN_POLL_MS = 1_000;
const MAX_POLL_MS = 5_000;

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

/** Publishes one batch of outbox rows; returns how many were sent. */
async function drainOutbox(producer: ReturnType<typeof kafka.producer>) {
  const rows = await client.zapRunOutbox.findMany({ take: BATCH_SIZE });
  if (rows.length === 0) return 0;

  await producer.send({
    topic: TOPIC_NAME,
    messages: rows.map((r) => ({ value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }) })),
  });
  await client.zapRunOutbox.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  console.log(`Published ${rows.length} zap run(s)`);
  return rows.length;
}

async function main() {
  await ensureTopic();
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  await producer.connect();

  let delay = MIN_POLL_MS;
  while (true) {
    try {
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
