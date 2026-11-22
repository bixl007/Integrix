import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ZapCreateSchema } from '../schemas';

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

  const { availableTriggerId, actions } = parsed.data;
  // Zap, trigger and back-reference are written atomically.
  const zapId = await prismaClient.$transaction(async (tx) => {
    const zap = await tx.zap.create({
      data: {
        userId: req.userId!,
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
