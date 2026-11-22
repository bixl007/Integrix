'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input, Select, Textarea } from '@/components/ui/input';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { useApi } from '@/hooks/use-api';
import type { Connection, Integration } from '@/lib/types';
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
  /** `{placeholders}` offered as one-click inserts while configuring an action. */
  suggestions?: string[];
  onPick: (step: PickedStep) => void;
  onClose: () => void;
}

/** Two-step dialog: choose an integration, then fill its config fields, if it has any. */
export function StepPicker({
  kind,
  items,
  initial,
  suggestions = [],
  onPick,
  onClose,
}: StepPickerProps) {
  const [selected, setSelected] = useState<Integration | undefined>(initial?.integration);
  const fields = selected ? (actionFields[selected.id] ?? []) : [];
  const configuring = selected && fields.length > 0;
  // Only connectors that take a connection load the user's saved ones.
  const connections = useApi<{ connections: Connection[] }>(
    fields.some((f) => f.connection) ? '/connection' : null,
  );

  // Fields are uncontrolled, so a suggestion is written straight into the last edited one.
  const formRef = useRef<HTMLFormElement>(null);
  const lastField = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const insert = (placeholder: string) => {
    const field =
      lastField.current ??
      formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    if (!field) return;
    field.setRangeText(placeholder, field.selectionStart ?? 0, field.selectionEnd ?? 0, 'end');
    field.focus();
  };

  const choose = (item: Integration) => {
    if (actionFields[item.id]?.length) setSelected(item);
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
        configuring && kind === 'action'
          ? 'Use {field} or {nested.field} for request values and {steps.2.field} for the output of an earlier step.'
          : undefined
      }
    >
      {configuring ? (
        <form
          ref={formRef}
          className="flex flex-col gap-4"
          onFocus={(e) => {
            const field = e.target;
            if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
              lastField.current = field;
            }
          }}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const metadata = Object.fromEntries(
              fields.map((f) => [f.key, String(data.get(f.key) ?? '')]),
            );
            onPick({ integration: selected, metadata });
          }}
        >
          {suggestions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                Fields from the latest run, or from the sender&apos;s example before the first one.
                Click one to insert it into the field you last edited.
              </p>
              <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => insert(s)}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {fields.map((f) => {
            const props = {
              name: f.key,
              label: f.label,
              required: !f.optional,
              hint:
                [
                  f.hint,
                  f.secret &&
                    'Kept on the server and hidden after you save. Leave the dots to keep the saved value.',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined,
              defaultValue:
                initial?.integration.id === selected.id ? initial.metadata[f.key] : undefined,
            };
            if (f.connection) {
              const mine = (connections.data?.connections ?? []).filter(
                (c) => c.connectorId === selected.id,
              );
              return (
                // Keyed on the loaded list so the saved choice is selected once the options exist.
                <Select
                  key={`${f.key}-${mine.length}`}
                  {...props}
                  hint="Your own account for this step. Add or remove connections under Settings."
                >
                  <option value="">{f.placeholder}</option>
                  {mine.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              );
            }
            if (f.options) {
              return (
                <Select key={f.key} {...props}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              );
            }
            return f.multiline ? (
              <Textarea key={f.key} {...props} placeholder={f.placeholder} />
            ) : (
              <Input
                key={f.key}
                {...props}
                placeholder={f.placeholder}
                type={f.secret ? 'password' : 'text'}
                autoComplete="off"
              />
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
