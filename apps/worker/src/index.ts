import { Prisma, PrismaClient, readRunActions, snapshotActions } from '@integrix/database';
import { sendMail } from '@integrix/mailer';
import { Kafka } from 'kafkajs';
import { actionHandlers } from './actions';
import { failureMail } from './notify';
import { runStatusAfter, runStep } from './stage';

const TOPIC_NAME = 'zap-events';
// A failing step retries in place; if it still fails, its run stops so the queue keeps moving.
const RETRY_DELAYS_MS = [1_000, 5_000, 10_000];
const prismaClient = new PrismaClient();

const kafka = new Kafka({
  clientId: 'worker',
  brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
});
const producer = kafka.producer();

interface StageMessage {
  zapRunId: string;
  stage: number;
}

const publishStage = (message: StageMessage) =>
  producer.send({ topic: TOPIC_NAME, messages: [{ value: JSON.stringify(message) }] });

/** Runs one stage, records it on the run, then queues the next stage or emails the owner on failure. */
async function handleStage({ zapRunId, stage }: StageMessage, heartbeat: () => Promise<void>) {
  const zapRun = await prismaClient.zapRun.findFirst({
    where: { id: zapRunId },
    include: {
      zap: {
        include: { actions: { include: { type: true } }, user: { select: { email: true } } },
      },
      steps: { where: { stage } },
    },
  });
  // Runs from before step snapshots fall back to the zap's current actions.
  const actions = zapRun && (readRunActions(zapRun.actions) ?? snapshotActions(zapRun.zap.actions));
  const action = actions?.[stage];
  if (!zapRun || !actions || !action) {
    console.warn(`No action for run ${zapRunId} stage ${stage}`);
    return;
  }
  const next = { zapRunId, stage: stage + 1 };

  // A redelivered stage that already passed must not repeat its side effect.
  if (zapRun.steps[0]?.status === 'success') {
    if (zapRun.status === 'running') await publishStage(next);
    return;
  }

  const handler = actionHandlers[action.actionId];
  if (!handler) console.warn(`No handler registered for action "${action.actionId}"`);
  const startedAt = new Date();
  // Heartbeats between attempts keep the consumer in its group during back-off.
  const result = await runStep(
    handler,
    action.metadata,
    zapRun.metadata,
    RETRY_DELAYS_MS,
    heartbeat,
  );
  const finishedAt = new Date();
  const status = runStatusAfter(result.status, stage >= actions.length - 1);

  const step = {
    actionId: action.actionId,
    status: result.status,
    error: result.error ?? null,
    output: result.output ?? Prisma.DbNull,
    startedAt,
    finishedAt,
  };
  await prismaClient.$transaction([
    prismaClient.zapRunStep.upsert({
      where: { zapRunId_stage: { zapRunId, stage } },
      create: { zapRunId, stage, ...step },
      update: step,
    }),
    prismaClient.zapRun.update({
      where: { id: zapRunId },
      data: { status, finishedAt: status === 'running' ? null : finishedAt },
    }),
  ]);

  // Each stage is a separate message, so a step retries alone; later steps never run after a failure.
  if (status === 'running') await publishStage(next);
  if (status !== 'failed') return;

  const attempts = RETRY_DELAYS_MS.length + 1;
  console.error(
    `Run ${zapRunId} stopped at stage ${stage} (${action.actionId}) after ${attempts} attempts: ${result.error}`,
  );
  try {
    await sendMail(
      failureMail({
        to: zapRun.zap.user.email,
        zapId: zapRun.zapId,
        zapName: zapRun.zap.name,
        stage,
        actionName: action.name,
        attempts,
        error: result.error,
      }),
    );
  } catch (e) {
    // Best effort: the failure is already on the run, so a mail outage must not redeliver the stage.
    console.error(
      `Could not email the owner of run ${zapRunId}:`,
      e instanceof Error ? e.message : e,
    );
  }
}

async function main() {
  const consumer = kafka.consumer({ groupId: 'main-worker' });
  await Promise.all([consumer.connect(), producer.connect()]);
  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ partition, message, heartbeat }) => {
      const raw = message.value?.toString();
      if (raw) await handleStage(JSON.parse(raw) as StageMessage, heartbeat);
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
