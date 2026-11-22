'use client';

import { Dialog } from '@/components/ui/dialog';
import { useApi } from '@/hooks/use-api';
import type { Connection, ZapAction } from '@/lib/types';
import { actionFields } from './action-fields';

/** Read-only view of an action's full settings, which the flow card truncates. */
export function StepDetailsDialog({
  action,
  index,
  onClose,
}: {
  action: ZapAction;
  index: number;
  onClose: () => void;
}) {
  const fields = actionFields[action.type.id] ?? [];
  const label = (key: string) => fields.find((f) => f.key === key)?.label ?? key;
  const connectionField = fields.find((f) => f.connection);
  const connections = useApi<{ connections: Connection[] }>(connectionField ? '/connection' : null);
  // A connection is stored as an id; show the name the user gave it.
  const display = (key: string, value: string) => {
    if (key !== connectionField?.key) return value;
    if (!value) return connectionField.placeholder;
    const found = connections.data?.connections.find((c) => c.id === value);
    return found?.name ?? (connections.loading ? '' : 'A connection that was deleted');
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Step ${index} · ${action.type.name}`}
      description="Placeholders like {name} are filled from the webhook body at run time."
    >
      <dl className="flex flex-col gap-4">
        {Object.entries(action.metadata ?? {}).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium">{label(key)}</dt>
            <dd className="rounded-md border border-border bg-background-subtle p-3 font-mono text-sm break-words whitespace-pre-wrap">
              {display(key, value) || <span className="text-muted-foreground">Empty</span>}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
