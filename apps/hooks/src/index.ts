import { PrismaClient, snapshotActions } from '@integrix/database';
import express from 'express';

const PORT = Number(process.env.HOOKS_PORT ?? 3002);
const client = new PrismaClient();
// This service is the intake of the webhook trigger; other triggers start their runs elsewhere.
const TRIGGER_ID = 'webhook';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Stores the run and its outbox row in one transaction; the processor publishes it.
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
  const zap = await client.zap.findUnique({
    where: { id: req.params.zapId },
    include: { trigger: true, actions: { include: { type: true } } },
  });
  if (!zap || zap.trigger?.triggerId !== TRIGGER_ID) {
    res.status(404).json({ message: 'Zap not found' });
    return;
  }
  if (!zap.enabled) {
    res.status(403).json({ message: 'This zap is turned off' });
    return;
  }

  await client.$transaction(async (tx) => {
    const run = await tx.zapRun.create({
      // The steps are copied onto the run, so editing the zap never changes a run in progress.
      data: { zapId: zap.id, metadata: req.body ?? {}, actions: snapshotActions(zap.actions) },
    });
    await tx.zapRunOutbox.create({ data: { zapRunId: run.id } });
  });
  res.json({ message: 'Webhook received' });
});

app.listen(PORT, () => {
  console.log(`Hooks listening on port ${PORT}`);
});
