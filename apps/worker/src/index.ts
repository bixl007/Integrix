import type { JsonObject } from '@integrix/database';
import { PrismaClient } from '@integrix/database';
import { Kafka } from 'kafkajs';
import { actionHandlers } from './actions';
import { retry } from './retry';

const TOPIC_NAME = 'zap-events';
// A failing step retries in place; if it still fails, its run stops so the queue keeps moving.
const RETRY_DELAYS_MS = [1_000, 5_000, 10_000];
const prismaClient = new PrismaClient();

const kafka = new Kafka({
  clientId: 'worker',
  brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
});

interface StageMessage {
  zapRunId: string;
  stage: number;
}

async function main() {
  const consumer = kafka.consumer({ groupId: 'main-worker' });
  const producer = kafka.producer();
  await Promise.all([consumer.connect(), producer.connect()]);
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ partition, message, heartbeat }) => {
      const raw = message.value?.toString();
      if (!raw) return;
      const { zapRunId, stage } = JSON.parse(raw) as StageMessage;

      const zapRun = await prismaClient.zapRun.findFirst({
        where: { id: zapRunId },
        include: { zap: { include: { actions: { include: { type: true } } } } },
      });
      const action = zapRun?.zap.actions.find((a) => a.sortingOrder === stage);
      if (!zapRun || !action) {
        console.warn(`No action for run ${zapRunId} stage ${stage}`);
        return;
      }

      const handler = actionHandlers[action.type.id];
      let failed = false;
      if (!handler) {
        console.warn(`No handler registered for action "${action.type.id}"`);
      } else {
        try {
          // Heartbeats between attempts keep the consumer in its group during back-off.
          await retry(
            () => handler((action.metadata ?? {}) as JsonObject, zapRun.metadata),
            RETRY_DELAYS_MS,
            heartbeat,
          );
        } catch (e) {
          failed = true;
          // shortcut: failures are only logged, record them on the run once runs have a status.
          console.error(
            `Run ${zapRunId} stopped at stage ${stage} (${action.type.id}) after ${RETRY_DELAYS_MS.length + 1} attempts:`,
            e instanceof Error ? e.message : e,
          );
        }
      }

      // Each stage is a separate message, so a step retries alone; later steps never run after a failure.
      if (!failed && stage < zapRun.zap.actions.length - 1) {
        await producer.send({
          topic: TOPIC_NAME,
          messages: [
            { value: JSON.stringify({ zapRunId, stage: stage + 1 } satisfies StageMessage) },
          ],
        });
      }

      await consumer.commitOffsets([
        { topic: TOPIC_NAME, partition, offset: (BigInt(message.offset) + 1n).toString() },
      ]);
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
