'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { RunHistory } from '@/components/zap/run-history';
import { StepDetailsDialog } from '@/components/zap/step-details-dialog';
import { StepConnector, StepNode } from '@/components/zap/step-node';
import { triggerPanels } from '@/components/zap/trigger-panels';
import { ZapActions } from '@/components/zap/zap-actions';
import { ZapToggle } from '@/components/zap/zap-toggle';
import { zapTitle } from '@/components/zap/zap-title';
import { useApi } from '@/hooks/use-api';
import type { Zap, ZapAction } from '@/lib/types';

export default function ZapDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, loading, reload } = useApi<{ zap: Zap | null }>(`/zap/${id}`);
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
        <ZapDetails zap={zap} onChanged={reload} onDeleted={() => router.push('/dashboard')} />
      )}
    </div>
  );
}

function ZapDetails({
  zap,
  onChanged,
  onDeleted,
}: {
  zap: Zap;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [viewing, setViewing] = useState<{ action: ZapAction; index: number }>();
  // The tab lives in the URL so the run-failure email can link straight to History.
  const showHistory = useSearchParams().get('tab') === 'history';
  const actions = zap.actions.toSorted((a, b) => a.sortingOrder - b.sortingOrder);
  const TriggerPanel = triggerPanels[zap.trigger?.type.id ?? ''];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight break-words">{zapTitle(zap)}</h1>
            <Badge variant={zap.enabled ? 'success' : 'neutral'}>
              {zap.enabled ? 'On' : 'Off'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {new Date(zap.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ZapToggle zap={zap} onChange={onChanged} />
          <ZapActions zap={zap} onRenamed={onChanged} onDeleted={onDeleted} />
        </div>
      </header>

      <Tabs
        label="Zap sections"
        tabs={[
          { label: 'Overview', href: `/zap/${zap.id}`, active: !showHistory },
          { label: 'History', href: `/zap/${zap.id}?tab=history`, active: showHistory },
        ]}
      />

      {showHistory ? (
        <RunHistory zapId={zap.id} integrations={actions.map((a) => a.type)} />
      ) : (
        <>
          {TriggerPanel && <TriggerPanel zap={zap} />}

          <Card>
            <CardHeader>
              <CardTitle>Flow</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <StepNode
                label="Trigger"
                index={1}
                integration={zap.trigger?.type}
                detail={Object.values(zap.trigger?.metadata ?? {}).join(' · ') || undefined}
              />
              {actions.map((a, i) => (
                <div key={a.id} className="flex w-full flex-col items-center">
                  <StepConnector />
                  <StepNode
                    label="Action"
                    index={i + 2}
                    integration={a.type}
                    detail={a.metadata ? Object.values(a.metadata).join(' · ') : undefined}
                    onClick={() => setViewing({ action: a, index: i + 2 })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {viewing && (
        <StepDetailsDialog
          action={viewing.action}
          index={viewing.index}
          onClose={() => setViewing(undefined)}
        />
      )}
    </div>
  );
}
