'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { StepConnector, StepNode } from '@/components/zap/step-node';
import { StepPicker, type PickedStep } from '@/components/zap/step-picker';
import { templateSteps, zapTemplates, type ZapTemplate } from '@/components/zap/zap-templates';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Integration } from '@/lib/types';

// Index of the step being edited: 'trigger' or an action position.
type Editing = 'trigger' | number | null;

export default function CreateZapPage() {
  // Read from the live URL: this page is prerendered, so the searchParams prop would be empty.
  const templateId = useSearchParams().get('template');
  const template = zapTemplates.find((t) => t.id === templateId);
  // Keyed so switching templates (or to a blank zap) starts from fresh builder state.
  return <ZapBuilder key={template?.id ?? 'blank'} template={template} />;
}

function ZapBuilder({ template }: { template?: ZapTemplate }) {
  const router = useRouter();
  const session = useSession();
  const triggers = useApi<{ availableTriggers: Integration[] }>('/trigger/available');
  const actions = useApi<{ availableActions: Integration[] }>('/action/available');

  const [name, setName] = useState(template?.name ?? '');
  const [trigger, setTrigger] = useState<PickedStep>();
  const [steps, setSteps] = useState<(PickedStep | undefined)[]>([undefined]);
  const [editing, setEditing] = useState<Editing>(null);
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

  const ready = !!trigger && steps.length > 0 && steps.every(Boolean);

  async function publish() {
    if (!trigger || !ready) return;
    setPublishing(true);
    setError(undefined);
    try {
      await api('/zap', {
        method: 'POST',
        body: {
          name,
          availableTriggerId: trigger.integration.id,
          triggerMetadata: trigger.metadata,
          actions: steps.map((s) => ({
            availableActionId: s!.integration.id,
            actionMetadata: s!.metadata,
          })),
        },
      });
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish the zap');
      setPublishing(false);
    }
  }

  function onPick(step: PickedStep) {
    if (editing === 'trigger') setTrigger(step);
    else if (typeof editing === 'number')
      setSteps((s) => s.map((x, i) => (i === editing ? step : x)));
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Zap</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {template && templateStatus === 'loaded'
              ? `Loaded the "${template.name}" template. Review each step, then publish.`
              : 'Pick a trigger, then chain actions in run order.'}
          </p>
        </div>
        <Button onClick={publish} disabled={!ready} loading={publishing}>
          Publish
        </Button>
      </div>

      {templateStatus === 'unavailable' && (
        <Alert variant="info" className="mb-6">
          This template needs an integration that isn&apos;t available on this server.
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
          onClick={() => setEditing('trigger')}
        />
        {steps.map((step, i) => (
          <div key={i} className="flex w-full flex-col items-center">
            <StepConnector />
            <StepNode
              label="Action"
              index={i + 2}
              integration={step?.integration}
              detail={step ? Object.values(step.metadata).join(' · ') : undefined}
              onClick={() => setEditing(i)}
              onRemove={
                steps.length > 1 ? () => setSteps((s) => s.filter((_, j) => j !== i)) : undefined
              }
            />
          </div>
        ))}
        <StepConnector />
        <Button variant="secondary" size="sm" onClick={() => setSteps((s) => [...s, undefined])}>
          <PlusIcon /> Add action
        </Button>
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
          onPick={onPick}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
