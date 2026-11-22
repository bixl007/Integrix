'use client';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { ChevronDownIcon, RotateIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { Integration, ZapRun, ZapRunStep } from '@/lib/types';
import { integrationCatalog } from './integration-catalog';
import { IntegrationIcon } from './integration-icon';
import { formatDuration, statusInfo } from './run-format';

// The trigger is step 1 on the zap page, so action stage 0 is step 2.
const stepNumber = (stage: number) => stage + 2;

function StatusBadge({ status }: { status: string }) {
  const { label, variant } = statusInfo(status);
  return <Badge variant={variant}>{label}</Badge>;
}

function runSummary(run: ZapRun) {
  const stopped = run.steps.find((s) => s.status === 'failed' || s.status === 'halted');
  if (stopped) return `stopped at step ${stepNumber(stopped.stage)}`;
  if (run.steps.length === 0) return undefined;
  return `${run.steps.length} ${run.steps.length === 1 ? 'step' : 'steps'}`;
}

function StepRow({ step, integration }: { step: ZapRunStep; integration?: Integration }) {
  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
          {stepNumber(step.stage)}
        </span>
        {integration && <IntegrationIcon integration={integration} className="size-6" />}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {integration?.name ?? step.actionId}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {formatDuration(step.startedAt, step.finishedAt)}
        </span>
        <StatusBadge status={step.status} />
      </div>
      {step.error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs break-words text-destructive">
          {step.error}
        </p>
      )}
      {step.output && <CodeBlock code={JSON.stringify(step.output, null, 2)} />}
    </li>
  );
}

/** Queues a failed run again from its failed step; `onDone` runs once the server accepts. */
function ReplayButton({
  zapId,
  runId,
  onDone,
}: {
  zapId: string;
  runId: string;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function replay() {
    setPending(true);
    setError(undefined);
    try {
      await api(`/zap/${zapId}/runs/${runId}/replay`, { method: 'POST' });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not replay the run');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border px-3 py-3">
      <Button variant="secondary" size="sm" onClick={replay} loading={pending}>
        <RotateIcon /> Replay from failed step
      </Button>
      <p className="text-xs text-muted-foreground">
        Uses the zap&apos;s current steps. Steps that already passed are not run again.
      </p>
      {error && <Alert className="w-full">{error}</Alert>}
    </div>
  );
}

/** Latest runs of a zap with each step's result; `integrations` are the zap's connectors, for names and icons. */
export function RunHistory({
  zapId,
  integrations,
}: {
  zapId: string;
  integrations: Integration[];
}) {
  const { data, error, loading, reload } = useApi<{ runs: ZapRun[] }>(`/zap/${zapId}/runs`);
  const byId = new Map(integrations.map((i) => [i.id, i]));
  // A step whose connector was since edited out of the zap still gets its built-in name and icon.
  const integrationFor = (id: string): Integration | undefined => {
    const known = integrationCatalog[id];
    return byId.get(id) ?? (known && { id, name: known.name, image: '' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Run history</CardTitle>
          <CardDescription>The latest 20 runs. Open a run to see each step.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={reload}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert>{error}</Alert>
        ) : loading || !data ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : data.runs.length === 0 ? (
          <Alert variant="info">
            No runs yet. Send a request to the webhook URL and refresh to see it here.
          </Alert>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.runs.map((run) => (
              <li key={run.id}>
                <details className="group rounded-md border border-border">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm hover:bg-background-subtle">
                    <StatusBadge status={run.status} />
                    <time dateTime={run.createdAt}>{new Date(run.createdAt).toLocaleString()}</time>
                    <span className="text-muted-foreground">
                      {[formatDuration(run.createdAt, run.finishedAt), runSummary(run)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <ChevronDownIcon className="ml-auto text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  {run.steps.length === 0 ? (
                    <p className="border-t border-border px-3 py-3 text-sm text-muted-foreground">
                      No steps have been recorded for this run.
                    </p>
                  ) : (
                    <ol className="divide-y divide-border border-t border-border px-3">
                      {run.steps.map((step) => (
                        <StepRow
                          key={step.stage}
                          step={step}
                          integration={integrationFor(step.actionId)}
                        />
                      ))}
                    </ol>
                  )}
                  {run.status === 'failed' && (
                    <ReplayButton zapId={zapId} runId={run.id} onDone={reload} />
                  )}
                </details>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
