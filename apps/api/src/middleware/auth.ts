import type { NextFunction, Request, Response } from 'express';
import { resolveSession } from '../services/session';

/** Requires a valid session cookie and sets req.userId. */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = await resolveSession(req);
  if (userId === null) {
    res.status(401).json({ message: 'You are not logged in' });
    return;
  }
  req.userId = userId;
  next();
}
