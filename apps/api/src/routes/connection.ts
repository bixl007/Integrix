import { connectionKey, seal } from '@integrix/database';
import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ConnectionCreateSchema } from '../schemas';

export const connectionRouter = Router();

// The credential itself is write-only: no route ever returns `secret`.
const publicFields = { id: true, connectorId: true, name: true, createdAt: true } as const;

connectionRouter.get('/', authMiddleware, async (req, res) => {
  const connections = await prismaClient.connection.findMany({
    where: { userId: req.userId },
    select: publicFields,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ connections });
});

connectionRouter.post('/', authMiddleware, async (req, res) => {
  const parsed = ConnectionCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Give the connection a name and fill in every field' });
    return;
  }
  const key = connectionKey();
  if (!key) {
    res.status(503).json({ message: 'Connections are not set up on this server' });
    return;
  }
  const { connectorId, name, values } = parsed.data;
  const connector = await prismaClient.availableAction.findUnique({ where: { id: connectorId } });
  const fields = connector?.connectionFields ?? [];
  // Exactly the connector's credential keys: nothing missing, nothing extra.
  const keys = Object.keys(values);
  if (fields.length === 0 || keys.length !== fields.length || !fields.every((f) => f in values)) {
    res.status(400).json({ message: 'These are not the fields this connector needs' });
    return;
  }
  const connection = await prismaClient.connection.create({
    data: { userId: req.userId!, connectorId, name, secret: seal(JSON.stringify(values), key) },
    select: publicFields,
  });
  res.json({ connection });
});

// Steps that still point at a deleted connection fail with a clear error when they run.
connectionRouter.delete('/:connectionId', authMiddleware, async (req, res) => {
  const { count } = await prismaClient.connection.deleteMany({
    where: { id: String(req.params.connectionId), userId: req.userId },
  });
  if (count === 0) {
    res.status(404).json({ message: 'Connection not found' });
    return;
  }
  res.json({ ok: true });
});
