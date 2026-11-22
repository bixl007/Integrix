'use client';

import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { integrationCatalog } from '@/components/zap/integration-catalog';
import { IntegrationIcon } from '@/components/zap/integration-icon';
import { useApi } from '@/hooks/use-api';
import type { Integration } from '@/lib/types';

export default function IntegrationsPage() {
  const triggers = useApi<{ availableTriggers: Integration[] }>('/trigger/available');
  const actions = useApi<{ availableActions: Integration[] }>('/action/available');
  const error = triggers.error ?? actions.error;
  const loading = triggers.loading || actions.loading;

  const items = [
    ...(triggers.data?.availableTriggers ?? []).map((i) => ({ ...i, kind: 'Trigger' as const })),
    ...(actions.data?.availableActions ?? []).map((i) => ({ ...i, kind: 'Action' as const })),
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Triggers start a zap. Actions run in order after it.
        </p>
      </div>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={`${item.kind}-${item.id}`}
              className="flex flex-col gap-4 rounded-lg border border-border p-5"
            >
              <div className="flex items-center justify-between">
                <IntegrationIcon integration={item} className="size-10" />
                <Badge variant={item.kind === 'Trigger' ? 'accent' : 'neutral'}>{item.kind}</Badge>
              </div>
              <div className="flex-1">
                <h2 className="font-medium">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {integrationCatalog[item.id]?.description ?? 'Available in the zap builder.'}
                </p>
              </div>
              <Link
                href="/zap/create"
                className={buttonVariants({
                  variant: 'secondary',
                  size: 'sm',
                  className: 'self-start',
                })}
              >
                Use in a Zap
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
