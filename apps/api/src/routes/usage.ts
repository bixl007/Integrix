import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { fillMonths, monthStart, type MonthUsage } from '../services/usage';

export const usageRouter = Router();

const MONTHS = 6;

// Steps that ran (passed, failed or halted) per UTC month; skipped steps did no work.
usageRouter.get('/', authMiddleware, async (req, res) => {
  const now = new Date();
  const rows = await prismaClient.$queryRaw<MonthUsage[]>`
    SELECT to_char(date_trunc('month', s."finishedAt"), 'YYYY-MM') AS month, count(*)::int AS steps
    FROM "ZapRunStep" s
    JOIN "ZapRun" r ON r.id = s."zapRunId"
    JOIN "Zap" z ON z.id = r."zapId"
    WHERE z."userId" = ${req.userId}
      AND s.status IN ('success', 'failed', 'halted')
      AND s."finishedAt" >= ${monthStart(now, MONTHS - 1)}
    GROUP BY 1`;
  res.json({ months: fillMonths(rows, now, MONTHS) });
});
