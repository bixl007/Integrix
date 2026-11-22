import { Router } from 'express';
import { prismaClient } from '../db';

export const triggerRouter = Router();

triggerRouter.get('/available', async (_req, res) => {
  const availableTriggers = await prismaClient.availableTrigger.findMany();
  res.json({ availableTriggers });
});
