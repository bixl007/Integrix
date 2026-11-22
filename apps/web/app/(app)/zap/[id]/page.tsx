'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { StepConnector, StepNode } from '@/components/zap/step-node';
import { zapTitle } from '@/components/zap/zap-card';
import { useApi } from '@/hooks/use-api';
import { webhookUrl } from '@/lib/config';
import type { Zap } from '@/lib/types';

export default function ZapDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading } = useApi<{ zap: Zap | null }>(`/zap/${id}`);
  const zap = data?.zap;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon /> Zaps
      </Link>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      ) : !zap ? (
        <Alert variant="info">This zap does not exist or belongs to another account.</Alert>
      ) : (
        <ZapDetails zap={zap} />
      )}
    </div>
  );
}

function ZapDetails({ zap }: { zap: Zap }) {
  const url = webhookUrl(zap.userId, zap.id);
  const actions = zap.actions.toSorted((a, b) => a.sortingOrder - b.sortingOrder);
  const curl = `curl -X POST ${url} \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Ada","email":"ada@example.com","amount":"0.01","address":"<wallet>"}'`;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{zapTitle(zap)}</h1>
          <Badge variant="success">Active</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Created {new Date(zap.createdAt).toLocaleString()}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>POST any JSON body here to start a run.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm">
              {url}
            </code>
            <CopyButton value={url} />
          </div>
          <pre className="overflow-x-auto rounded-md border border-border bg-background-subtle p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {curl}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <StepNode label="Trigger" index={1} integration={zap.trigger?.type} />
          {actions.map((a, i) => (
            <div key={a.id} className="flex w-full flex-col items-center">
              <StepConnector />
              <StepNode
                label="Action"
                index={i + 2}
                integration={a.type}
                detail={a.metadata ? Object.values(a.metadata).join(' · ') : undefined}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
