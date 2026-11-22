'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useSession } from '@/lib/session';
import type { Integration, Zap } from '@/lib/types';
import { actionFields, stepSummary } from './action-fields';
import { fieldSuggestions, type ZapSample } from './field-paths';
import { moveItem } from './reorder';
import { StepConnector, StepNode } from './step-node';
import { StepPicker, type PickedStep } from './step-picker';
import { webhookSender } from './webhook-senders';
import { templateSteps, type ZapTemplate } from './zap-templates';

/** Labels of the required settings a step still lacks (a template leaves credentials empty). */
export const missingSettings = (step: PickedStep) =>
  (actionFields[step.integration.id] ?? [])
    .filter((f) => !f.optional && !step.metadata[f.key]?.trim())
    .map((f) => f.label);

// Index of the step being edited: 'trigger' or an action position.
type Editing = 'trigger' | number | null;

/** The zap editor: a blank or template-prefilled new zap, or an existing `zap` whose steps it replaces. */
export function ZapBuilder({ template, zap }: { template?: ZapTemplate; zap?: Zap }) {
  const router = useRouter();
  const session = useSession();
  const triggers = useApi<{ availableTriggers: Integration[] }>('/trigger/available');
  const actions = useApi<{ availableActions: Integration[] }>('/action/available');
  // Only a saved zap has requests to suggest fields from.
  const sample = useApi<{ sample: ZapSample | null }>(zap ? `/zap/${zap.id}/sample` : null);

  const [name, setName] = useState(zap?.name ?? template?.name ?? '');
  const [trigger, setTrigger] = useState<PickedStep | undefined>(
    zap?.trigger
      ? { integration: zap.trigger.type, metadata: zap.trigger.metadata ?? {} }
      : undefined,
  );
  const [steps, setSteps] = useState<(PickedStep | undefined)[]>(
    zap
      ? zap.actions
          .toSorted((a, b) => a.sortingOrder - b.sortingOrder)
          .map((a) => ({ id: a.id, integration: a.type, metadata: a.metadata ?? {} }))
      : [undefined],
  );
  const [editing, setEditing] = useState<Editing>(null);
  // Positions of the action being dragged and the one it is over.
  const [drag, setDrag] = useState<{ from: number; over: number }>();
  const [error, setError] = useState<string>();
  const [publishing, setPublishing] = useState(false);
  const [templateStatus, setTemplateStatus] = useState<'pending' | 'loaded' | 'unavailable'>(
    'pending',
  );

  // Prefill a docs template (?template=<id>) once, after both integration lists load.
  if (
    template &&
    templateStatus === 'pending' &&
    triggers.data &&
    actions.data &&
    session.status === 'authenticated'
  ) {
    const resolved = templateSteps(
      template,
      triggers.data.availableTriggers,
      actions.data.availableActions,
      session.user.email,
    );
    setTemplateStatus(resolved ? 'loaded' : 'unavailable');
    if (resolved) {
      setTrigger(resolved.trigger);
      setSteps(resolved.steps);
    }
  }

  // Before the first real request, suggest fields from the chosen sender's example payload.
  const preset = webhookSender(trigger?.metadata.sender).samplePayload;
  const presetSample = preset ? { payload: preset, steps: [] } : undefined;

  const incomplete = [trigger, ...steps].flatMap((step, i) => {
    const missing = step ? missingSettings(step) : [];
    return missing.length
      ? [`Step ${i + 1} (${step?.integration.name}): ${missing.join(', ')}`]
      : [];
  });
  const ready = !!trigger && steps.length > 0 && steps.every(Boolean) && incomplete.length === 0;

  async function publish() {
    if (!trigger || !ready) return;
    setPublishing(true);
    setError(undefined);
    try {
      await api(zap ? `/zap/${zap.id}` : '/zap', {
        method: zap ? 'PUT' : 'POST',
        body: {
          name,
          availableTriggerId: trigger.integration.id,
          triggerMetadata: trigger.metadata,
          actions: steps.map((s) => ({
            id: s!.id,
            availableActionId: s!.integration.id,
            actionMetadata: s!.metadata,
          })),
        },
      });
      router.push(zap ? `/zap/${zap.id}` : '/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the zap');
      setPublishing(false);
    }
  }

  function onPick(step: PickedStep) {
    if (editing === 'trigger') setTrigger(step);
    else if (typeof editing === 'number')
      setSteps((s) =>
        s.map((x, i) =>
          // A step that keeps its connector keeps its saved action, and with it its credential.
          i === editing
            ? { ...step, id: x?.integration.id === step.integration.id ? x.id : undefined }
            : x,
        ),
      );
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{zap ? 'Edit Zap' : 'New Zap'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {zap
              ? 'Saving replaces the steps. Runs already in progress finish with the steps they started with.'
              : template && templateStatus === 'loaded'
                ? `Loaded the "${template.name}" template. Review each step, then publish.`
                : 'Pick a trigger, then chain actions in run order.'}
          </p>
        </div>
        <Button onClick={publish} disabled={!ready} loading={publishing}>
          {zap ? 'Save changes' : 'Publish'}
        </Button>
      </div>

      {templateStatus === 'unavailable' && (
        <Alert variant="info" className="mb-6">
          This template needs an integration that isn&apos;t available on this server.
        </Alert>
      )}

      {incomplete.length > 0 && (
        <Alert variant="info" className="mb-6">
          Fill in these settings before saving. {incomplete.join('. ')}.
        </Alert>
      )}

      {(error ?? triggers.error ?? actions.error) && (
        <Alert className="mb-6">{error ?? triggers.error ?? actions.error}</Alert>
      )}

      <div className="mb-6">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Untitled zap"
          hint="Optional. Without a name, the zap shows its step names."
        />
      </div>

      <div className="flex flex-col items-center rounded-lg border border-border bg-background-subtle bg-[radial-gradient(var(--color-border-strong)_1px,transparent_1px)] [background-size:16px_16px] px-4 py-10">
        <StepNode
          label="Trigger"
          index={1}
          integration={trigger?.integration}
          detail={trigger && stepSummary(trigger.integration.id, trigger.metadata)}
          onClick={() => setEditing('trigger')}
        />
        {steps.map((step, i) => (
          <div key={i} className="flex w-full flex-col items-center">
            <StepConnector />
            <div
              draggable={steps.length > 1}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                // Firefox only starts a drag that carries data.
                e.dataTransfer.setData('text/plain', String(i));
                setDrag({ from: i, over: i });
              }}
              onDragOver={(e) => {
                if (!drag) return;
                e.preventDefault();
                if (drag.over !== i) setDrag({ from: drag.from, over: i });
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (drag) setSteps((s) => moveItem(s, drag.from, i));
                setDrag(undefined);
              }}
              onDragEnd={() => setDrag(undefined)}
              className={cn(
                'w-full max-w-md rounded-lg',
                drag?.from === i && 'opacity-50',
                drag && drag.over === i && drag.from !== i && 'ring-2 ring-foreground/40',
              )}
            >
              <StepNode
                label="Action"
                index={i + 2}
                integration={step?.integration}
                detail={step && stepSummary(step.integration.id, step.metadata)}
                onClick={() => setEditing(i)}
                onRemove={
                  steps.length > 1 ? () => setSteps((s) => s.filter((_, j) => j !== i)) : undefined
                }
                reorder={
                  steps.length > 1
                    ? {
                        onMoveUp: i > 0 ? () => setSteps((s) => moveItem(s, i, i - 1)) : undefined,
                        onMoveDown:
                          i < steps.length - 1
                            ? () => setSteps((s) => moveItem(s, i, i + 1))
                            : undefined,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        ))}
        <StepConnector />
        <Button variant="secondary" size="sm" onClick={() => setSteps((s) => [...s, undefined])}>
          <PlusIcon /> Add action
        </Button>
        {steps.length > 1 && (
          <p className="mt-6 max-w-md text-center text-xs text-muted-foreground">
            Drag a step by its handle, or use its arrows, to change the order. Placeholders such as{' '}
            <code className="font-mono">{'{steps.2.field}'}</code> point at positions, so check them
            after moving a step.
          </p>
        )}
      </div>

      {editing !== null && (
        <StepPicker
          key={String(editing)}
          kind={editing === 'trigger' ? 'trigger' : 'action'}
          items={
            editing === 'trigger'
              ? (triggers.data?.availableTriggers ?? [])
              : (actions.data?.availableActions ?? [])
          }
          initial={editing === 'trigger' ? trigger : steps[editing]}
          suggestions={
            editing === 'trigger'
              ? undefined
              : fieldSuggestions(sample.data?.sample ?? presetSample, editing)
          }
          onPick={onPick}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
