import { PrismaClient, snapshotActions } from '@integrix/database';
import express, { type Request } from 'express';
import { verifyWebhook } from './signatures';

const PORT = Number(process.env.HOOKS_PORT ?? 3002);
const client = new PrismaClient();
// This service is the intake of the webhook trigger; other triggers start their runs elsewhere.
const TRIGGER_ID = 'webhook';

type RawBodyRequest = Request & { rawBody?: Buffer };

const app = express();
app.disable('x-powered-by');
app.use(
  express.json({
    limit: '100kb',
    // Signatures are computed over the exact bytes the sender sent, not the parsed JSON.
    verify: (req, _res, buf) => {
      (req as RawBodyRequest).rawBody = buf;
    },
  }),
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Stores the run and its outbox row in one transaction; the processor publishes it.
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
  const zap = await client.zap.findUnique({
    where: { id: req.params.zapId },
    include: { trigger: true, actions: { include: { type: true } } },
  });
  // A wrong user id in the URL is answered like an unknown zap, so ids can't be probed.
  const owned = zap && String(zap.userId) === req.params.userId;
  if (!zap || !owned || zap.trigger?.triggerId !== TRIGGER_ID) {
    res.status(404).json({ message: 'Zap not found' });
    return;
  }
  if (!zap.enabled) {
    res.status(403).json({ message: 'This zap is turned off' });
    return;
  }

  const settings = zap.trigger.metadata;
  const signed = verifyWebhook(
    settings !== null && typeof settings === 'object' && !Array.isArray(settings) ? settings : {},
    {
      rawBody: (req as RawBodyRequest).rawBody ?? Buffer.alloc(0),
      header: (name) => req.get(name),
    },
  );
  if (!signed) {
    res.status(401).json({ message: 'Invalid webhook signature' });
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
