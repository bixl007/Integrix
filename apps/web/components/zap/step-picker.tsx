'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { ArrowLeftIcon } from '@/components/ui/icons';
import type { Integration } from '@/lib/types';
import { actionFields } from './action-fields';
import { IntegrationIcon } from './integration-icon';

export interface PickedStep {
  integration: Integration;
  metadata: Record<string, string>;
}

interface StepPickerProps {
  kind: 'trigger' | 'action';
  items: Integration[];
  initial?: PickedStep;
  onPick: (step: PickedStep) => void;
  onClose: () => void;
}

/** Two-step dialog: choose an integration, then fill its config fields (actions only). */
export function StepPicker({ kind, items, initial, onPick, onClose }: StepPickerProps) {
  const [selected, setSelected] = useState<Integration | undefined>(initial?.integration);
  const fields = selected ? (actionFields[selected.id] ?? []) : [];
  const configuring = kind === 'action' && selected && fields.length > 0;

  const choose = (item: Integration) => {
    if (kind === 'action' && actionFields[item.id]?.length) setSelected(item);
    else onPick({ integration: item, metadata: {} });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={
        configuring
          ? `Configure ${selected.name}`
          : `Choose ${kind === 'trigger' ? 'a trigger' : 'an action'}`
      }
      description={
        configuring ? 'Use {field} or {nested.field} to insert webhook payload values.' : undefined
      }
    >
      {configuring ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const metadata = Object.fromEntries(
              fields.map((f) => [f.key, String(data.get(f.key) ?? '')]),
            );
            onPick({ integration: selected, metadata });
          }}
        >
          {fields.map((f) => {
            const props = {
              name: f.key,
              label: f.label,
              placeholder: f.placeholder,
              required: true,
              defaultValue:
                initial?.integration.id === selected.id ? initial.metadata[f.key] : undefined,
            };
            return f.multiline ? (
              <Textarea key={f.key} {...props} />
            ) : (
              <Input key={f.key} {...props} />
            );
          })}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={() => setSelected(undefined)}>
              <ArrowLeftIcon /> Back
            </Button>
            <Button type="submit">Save step</Button>
          </div>
        </form>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing available yet. Is the database seeded?
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => choose(item)}
                className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left text-sm font-medium transition-colors hover:border-border-strong hover:bg-muted"
              >
                <IntegrationIcon integration={item} />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
