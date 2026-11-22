import { PrismaClient } from '@integrix/database';
import express from 'express';

const PORT = Number(process.env.HOOKS_PORT ?? 3002);
const client = new PrismaClient();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Stores the run and its outbox row in one transaction; the processor publishes it.
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
  await client.$transaction(async (tx) => {
    const run = await tx.zapRun.create({
      data: { zapId: req.params.zapId, metadata: req.body ?? {} },
    });
    await tx.zapRunOutbox.create({ data: { zapRunId: run.id } });
  });
  res.json({ message: 'Webhook received' });
});

app.listen(PORT, () => {
  console.log(`Hooks listening on port ${PORT}`);
});
