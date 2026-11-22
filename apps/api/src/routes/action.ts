import { Router } from 'express';
import { prismaClient } from '../db';

export const actionRouter = Router();

actionRouter.get('/available', async (_req, res) => {
  const availableActions = await prismaClient.availableAction.findMany();
  res.json({ availableActions });
});
