'use client';

import { Dialog } from '@/components/ui/dialog';
import type { ZapAction } from '@/lib/types';
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
              {value || <span className="text-muted-foreground">Empty</span>}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
