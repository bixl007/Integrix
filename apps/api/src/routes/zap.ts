import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ZapCreateSchema, ZapRenameSchema } from '../schemas';

export const zapRouter = Router();

const zapInclude = {
  actions: { include: { type: true } },
  trigger: { include: { type: true } },
} as const;

zapRouter.post('/', authMiddleware, async (req, res) => {
  const parsed = ZapCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const { name, availableTriggerId, actions } = parsed.data;
  // Zap, trigger and back-reference are written atomically.
  const zapId = await prismaClient.$transaction(async (tx) => {
    const zap = await tx.zap.create({
      data: {
        userId: req.userId!,
        name: name ?? null,
        triggerId: '',
        actions: {
          create: actions.map((a, index) => ({
            actionId: a.availableActionId,
            sortingOrder: index,
            metadata: a.actionMetadata,
          })),
        },
      },
    });
    const trigger = await tx.trigger.create({
      data: { triggerId: availableTriggerId, zapId: zap.id },
    });
    await tx.zap.update({ where: { id: zap.id }, data: { triggerId: trigger.id } });
    return zap.id;
  });

  res.json({ zapId });
});

zapRouter.get('/', authMiddleware, async (req, res) => {
  const zaps = await prismaClient.zap.findMany({
    where: { userId: req.userId },
    include: zapInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ zaps });
});

zapRouter.get('/:zapId', authMiddleware, async (req, res) => {
  const zap = await prismaClient.zap.findFirst({
    where: { id: String(req.params.zapId), userId: req.userId },
    include: zapInclude,
  });
  res.json({ zap });
});

// shortcut: latest 20 runs only, add cursor pagination when history has to reach further back.
const RUN_HISTORY_LIMIT = 20;

// The request body is left out: it can be 100 KB per run.
zapRouter.get('/:zapId/runs', authMiddleware, async (req, res) => {
  const runs = await prismaClient.zapRun.findMany({
    where: { zapId: String(req.params.zapId), zap: { userId: req.userId } },
    select: {
      id: true,
      status: true,
      createdAt: true,
      finishedAt: true,
      steps: {
        orderBy: { stage: 'asc' },
        select: {
          stage: true,
          actionId: true,
          status: true,
          error: true,
          output: true,
          startedAt: true,
          finishedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: RUN_HISTORY_LIMIT,
  });
  res.json({ runs });
});

zapRouter.patch('/:zapId', authMiddleware, async (req, res) => {
  const parsed = ZapRenameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Name must be at most 80 characters' });
    return;
  }
  const where = { id: String(req.params.zapId), userId: req.userId };
  const { count } = await prismaClient.zap.updateMany({ where, data: { name: parsed.data.name } });
  if (count === 0) {
    res.status(404).json({ message: 'Zap not found' });
    return;
  }
  const zap = await prismaClient.zap.findFirst({ where, include: zapInclude });
  res.json({ zap });
});

// Trigger, actions, runs and pending outbox rows cascade in the database.
zapRouter.delete('/:zapId', authMiddleware, async (req, res) => {
  const { count } = await prismaClient.zap.deleteMany({
    where: { id: String(req.params.zapId), userId: req.userId },
  });
  if (count === 0) {
    res.status(404).json({ message: 'Zap not found' });
    return;
  }
  res.json({ ok: true });
});
