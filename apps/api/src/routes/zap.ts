import { firstRunAt, scheduleIntervals, snapshotActions } from '@integrix/database';
import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ZapCreateSchema, ZapUpdateSchema } from '../schemas';

export const zapRouter = Router();

const zapInclude = {
  actions: { include: { type: true } },
  trigger: { include: { type: true } },
} as const;

/** True when trigger settings name a schedule interval the processor doesn't know. */
const unknownInterval = (triggerMetadata: Record<string, string>) =>
  triggerMetadata.interval !== undefined && !(triggerMetadata.interval in scheduleIntervals);

zapRouter.post('/', authMiddleware, async (req, res) => {
  const parsed = ZapCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const { name, availableTriggerId, triggerMetadata = {}, actions } = parsed.data;
  if (unknownInterval(triggerMetadata)) {
    res.status(400).json({ message: 'Unknown schedule interval' });
    return;
  }
  // Zap, trigger and back-reference are written atomically.
  const zapId = await prismaClient.$transaction(async (tx) => {
    const zap = await tx.zap.create({
      data: {
        userId: req.userId!,
        name: name ?? null,
        nextRunAt: firstRunAt(triggerMetadata, new Date()),
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
      data: { triggerId: availableTriggerId, metadata: triggerMetadata, zapId: zap.id },
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

// The latest request and its step outputs, which the builder turns into field suggestions.
zapRouter.get('/:zapId/sample', authMiddleware, async (req, res) => {
  const run = await prismaClient.zapRun.findFirst({
    where: { zapId: String(req.params.zapId), zap: { userId: req.userId } },
    select: {
      metadata: true,
      steps: { orderBy: { stage: 'asc' }, select: { stage: true, output: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ sample: run && { payload: run.metadata, steps: run.steps } });
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

// Queues a failed run again from the step that failed; earlier steps and their outputs are kept.
zapRouter.post('/:zapId/runs/:runId/replay', authMiddleware, async (req, res) => {
  const id = String(req.params.runId);
  const zap = { id: String(req.params.zapId), userId: req.userId };
  const outcome = await prismaClient.$transaction(async (tx) => {
    const failed = await tx.zapRunStep.findFirst({
      where: { zapRunId: id, status: 'failed', zapRun: { status: 'failed', zap } },
    });
    if (!failed) return 'none';
    // The replay runs the zap's current steps, so a setting fixed after the failure takes effect.
    const actions = await tx.action.findMany({
      where: { zapId: zap.id },
      include: { type: true },
    });
    if (failed.stage >= actions.length) return 'moved';
    // The status guard makes a double click queue the run once.
    const { count } = await tx.zapRun.updateMany({
      where: { id, status: 'failed' },
      data: { status: 'queued', finishedAt: null, actions: snapshotActions(actions) },
    });
    if (count === 0) return 'none';
    await tx.zapRunOutbox.create({ data: { zapRunId: id, stage: failed.stage } });
    return 'queued';
  });
  if (outcome === 'none') {
    res.status(404).json({ message: 'No failed run to replay' });
    return;
  }
  if (outcome === 'moved') {
    res.status(409).json({ message: 'The zap no longer has a step at the failed position' });
    return;
  }
  res.json({ ok: true });
});

zapRouter.patch('/:zapId', authMiddleware, async (req, res) => {
  const parsed = ZapUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Send a name of at most 80 characters, enabled, or both' });
    return;
  }
  const where = { id: String(req.params.zapId), userId: req.userId };
  // Switching a scheduled zap back on restarts its schedule from now, so it doesn't fire for a stale time.
  const trigger = parsed.data.enabled
    ? await prismaClient.trigger.findFirst({ where: { zap: where } })
    : null;
  const { count } = await prismaClient.zap.updateMany({
    where,
    data: {
      ...parsed.data,
      ...(trigger && { nextRunAt: firstRunAt(trigger.metadata, new Date()) }),
    },
  });
  if (count === 0) {
    res.status(404).json({ message: 'Zap not found' });
    return;
  }
  const zap = await prismaClient.zap.findFirst({ where, include: zapInclude });
  res.json({ zap });
});

// Replaces the zap's steps; runs already started keep the steps copied onto them at intake.
zapRouter.put('/:zapId', authMiddleware, async (req, res) => {
  const parsed = ZapCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }
  const { name, availableTriggerId, triggerMetadata = {}, actions } = parsed.data;
  if (unknownInterval(triggerMetadata)) {
    res.status(400).json({ message: 'Unknown schedule interval' });
    return;
  }
  const zapId = String(req.params.zapId);
  const where = { id: zapId, userId: req.userId };

  const found = await prismaClient.$transaction(async (tx) => {
    const { count } = await tx.zap.updateMany({
      where,
      data: { name, nextRunAt: firstRunAt(triggerMetadata, new Date()) },
    });
    if (count === 0) return false;
    await tx.trigger.update({
      where: { zapId },
      data: { triggerId: availableTriggerId, metadata: triggerMetadata },
    });
    await tx.action.deleteMany({ where: { zapId } });
    await tx.action.createMany({
      data: actions.map((a, index) => ({
        zapId,
        actionId: a.availableActionId,
        sortingOrder: index,
        metadata: a.actionMetadata ?? {},
      })),
    });
    return true;
  });
  if (!found) {
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
