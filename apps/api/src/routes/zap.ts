import { firstRunAt, scheduleIntervals, snapshotActions } from '@integrix/database';
import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ZapCreateSchema, ZapUpdateSchema } from '../schemas';
import { maskSecrets, restoreSecrets } from '../services/secrets';

export const zapRouter = Router();

const zapInclude = {
  actions: { include: { type: true } },
  trigger: { include: { type: true } },
} as const;

type Metadata = Record<string, string>;

interface StoredAction {
  actionId: string;
  metadata: unknown;
  type: { secretFields: string[] };
}

interface StoredTrigger {
  triggerId: string;
  metadata: unknown;
  type: { secretFields: string[] };
}

/** The zap as the client may see it: secret settings are replaced by a mask. */
const maskZap = <Z extends { actions: StoredAction[]; trigger: StoredTrigger | null }>(
  zap: Z,
): Z => ({
  ...zap,
  // Trigger and action metadata are only ever written as flat string maps (zod, below).
  trigger: zap.trigger && {
    ...zap.trigger,
    metadata: maskSecrets((zap.trigger.metadata ?? {}) as Metadata, zap.trigger.type.secretFields),
  },
  actions: zap.actions.map((a) => ({
    ...a,
    metadata: maskSecrets((a.metadata ?? {}) as Metadata, a.type.secretFields),
  })),
});

/** Trigger settings ready to store, or an error message; an unchanged mask keeps the stored secret. */
async function resolveTrigger(
  triggerId: string,
  metadata: Metadata,
  stored?: StoredTrigger | null,
) {
  const type = await prismaClient.availableTrigger.findUnique({ where: { id: triggerId } });
  if (!type) return { error: `Unknown trigger "${triggerId}"` };
  if (metadata.interval !== undefined && !(metadata.interval in scheduleIntervals)) {
    return { error: 'Unknown schedule interval' };
  }
  const restored = restoreSecrets(
    metadata,
    type.secretFields,
    stored?.triggerId === triggerId ? (stored.metadata as Metadata) : undefined,
  );
  if ('missing' in restored) return { error: 'Enter the trigger secret again' };
  return { metadata: restored.metadata };
}

interface ActionInput {
  availableActionId: string;
  actionMetadata?: Metadata;
}

/**
 * Turns request actions into rows, swapping an unchanged mask for the secret stored at the same position.
 * Returns an error message when an action id is unknown or a secret has to be entered again.
 */
async function resolveActions(
  actions: ActionInput[],
  userId: number | undefined,
  stored: StoredAction[] = [],
) {
  const types = await prismaClient.availableAction.findMany({
    where: { id: { in: actions.map((a) => a.availableActionId) } },
  });
  const secretFields = new Map(types.map((t) => [t.id, t.secretFields]));
  const connectionIds = actions.flatMap((a) => a.actionMetadata?.connectionId || []);
  const connections = connectionIds.length
    ? await prismaClient.connection.findMany({ where: { id: { in: connectionIds }, userId } })
    : [];
  const rows: { actionId: string; sortingOrder: number; metadata: Metadata }[] = [];
  for (const [index, action] of actions.entries()) {
    const fields = secretFields.get(action.availableActionId);
    if (!fields) return { error: `Unknown action "${action.availableActionId}"` };
    const previous = stored[index];
    const restored = restoreSecrets(
      action.actionMetadata ?? {},
      fields,
      previous?.actionId === action.availableActionId ? (previous.metadata as Metadata) : undefined,
    );
    const connectionId = action.actionMetadata?.connectionId;
    const owned = connections.some(
      (c) => c.id === connectionId && c.connectorId === action.availableActionId,
    );
    // Steps are numbered like the builder: the trigger is step 1.
    if (connectionId && !owned) return { error: `Pick the connection for step ${index + 2} again` };
    if ('missing' in restored) return { error: `Enter the secret for step ${index + 2} again` };
    rows.push({
      actionId: action.availableActionId,
      sortingOrder: index,
      metadata: restored.metadata,
    });
  }
  return { rows };
}

zapRouter.post('/', authMiddleware, async (req, res) => {
  const parsed = ZapCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const { name, availableTriggerId, actions } = parsed.data;
  const trigger = await resolveTrigger(availableTriggerId, parsed.data.triggerMetadata ?? {});
  if (!trigger.metadata) {
    res.status(400).json({ message: trigger.error });
    return;
  }
  const triggerMetadata = trigger.metadata;
  const resolved = await resolveActions(actions, req.userId);
  if (!resolved.rows) {
    res.status(400).json({ message: resolved.error });
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
        actions: { create: resolved.rows },
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
  res.json({ zaps: zaps.map(maskZap) });
});

zapRouter.get('/:zapId', authMiddleware, async (req, res) => {
  const zap = await prismaClient.zap.findFirst({
    where: { id: String(req.params.zapId), userId: req.userId },
    include: zapInclude,
  });
  res.json({ zap: zap && maskZap(zap) });
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
  res.json({ zap: zap && maskZap(zap) });
});

// Replaces the zap's steps; runs already started keep the steps copied onto them at intake.
zapRouter.put('/:zapId', authMiddleware, async (req, res) => {
  const parsed = ZapCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }
  const { name, availableTriggerId, actions } = parsed.data;
  const zapId = String(req.params.zapId);
  const where = { id: zapId, userId: req.userId };
  const trigger = await resolveTrigger(
    availableTriggerId,
    parsed.data.triggerMetadata ?? {},
    await prismaClient.trigger.findFirst({ where: { zap: where }, include: { type: true } }),
  );
  if (!trigger.metadata) {
    res.status(400).json({ message: trigger.error });
    return;
  }
  const triggerMetadata = trigger.metadata;
  const stored = await prismaClient.action.findMany({
    where: { zap: where },
    include: { type: true },
    orderBy: { sortingOrder: 'asc' },
  });
  const resolved = await resolveActions(actions, req.userId, stored);
  if (!resolved.rows) {
    res.status(400).json({ message: resolved.error });
    return;
  }
  const rows = resolved.rows;

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
    await tx.action.createMany({ data: rows.map((row) => ({ zapId, ...row })) });
    return true;
  });
  if (!found) {
    res.status(404).json({ message: 'Zap not found' });
    return;
  }
  const zap = await prismaClient.zap.findFirst({ where, include: zapInclude });
  res.json({ zap: zap && maskZap(zap) });
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
