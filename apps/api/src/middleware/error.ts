import type { NextFunction, Request, Response } from 'express';

/** Last-resort handler; Express 5 forwards rejected async handlers here. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
