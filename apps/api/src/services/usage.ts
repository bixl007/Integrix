export interface MonthUsage {
  /** `YYYY-MM`, in UTC. */
  month: string;
  steps: number;
}

/** First instant of the UTC month `monthsBack` months before `now`. */
export const monthStart = (now: Date, monthsBack: number) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));

/** The last `count` months, oldest first, with 0 for months that have no rows. */
export function fillMonths(rows: readonly MonthUsage[], now: Date, count: number): MonthUsage[] {
  const steps = new Map(rows.map((row) => [row.month, row.steps]));
  return Array.from({ length: count }, (_, i) => {
    const month = monthStart(now, count - 1 - i)
      .toISOString()
      .slice(0, 7);
    return { month, steps: steps.get(month) ?? 0 };
  });
}
