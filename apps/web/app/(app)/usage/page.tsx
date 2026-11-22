'use client';

import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';

interface MonthUsage {
  /** `YYYY-MM`, in UTC. */
  month: string;
  steps: number;
}

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

export default function UsagePage() {
  const { data, error, loading } = useApi<{ months: MonthUsage[] }>('/usage');
  const months = data?.months ?? [];
  const max = Math.max(1, ...months.map((m) => m.steps));
  const current = months.at(-1);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Steps your zaps ran each month, counted in UTC. A step counts whether it passed, failed or
          halted the run.
        </p>
      </div>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading || !current ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardDescription>{monthLabel(current.month)} so far</CardDescription>
              <CardTitle className="text-4xl tabular-nums">{current.steps}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {current.steps === 1 ? 'step run' : 'steps run'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last six months</CardTitle>
            </CardHeader>
            <CardContent>
              {months.every((m) => m.steps === 0) ? (
                <Alert variant="info">
                  No steps have run in the last six months. Send a request to a zap to see it here.
                </Alert>
              ) : (
                <ol className="flex flex-col gap-4">
                  {months.toReversed().map((m) => (
                    <li key={m.month} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span>{monthLabel(m.month)}</span>
                        <span className="font-mono text-muted-foreground tabular-nums">
                          {m.steps}
                        </span>
                      </div>
                      <div aria-hidden className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(m.steps / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
