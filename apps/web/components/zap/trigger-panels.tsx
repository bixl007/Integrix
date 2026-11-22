import type { ComponentType } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { CopyButton } from '@/components/ui/copy-button';
import { webhookUrl } from '@/lib/config';
import type { Zap } from '@/lib/types';
import { actionFields } from './action-fields';
import { samplePayload, webhookCurl } from './sample-payload';
import { webhookSender } from './webhook-senders';

function WebhookPanel({ zap }: { zap: Zap }) {
  const url = webhookUrl(zap.userId, zap.id);
  // Example body built from the placeholders this zap's steps actually read.
  const curl = webhookCurl(
    url,
    samplePayload(zap.actions.flatMap((a) => Object.values(a.metadata ?? {}))),
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook URL</CardTitle>
        <CardDescription>
          POST a JSON body here to start a run. The example sends every field your steps use;
          replace each <code className="font-mono">&lt;value&gt;</code> with real data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm">
            {url}
          </code>
          <CopyButton value={url} />
        </div>
        <CodeBlock code={curl} />
        <p className="text-sm text-muted-foreground">
          {zap.trigger?.metadata?.secret
            ? `Only signed requests are accepted. Checked header: ${webhookSender(zap.trigger.metadata.sender).verifiedBy}.`
            : 'Anyone who has this URL can start a run. Add a signing secret to the trigger under Edit steps to require signed requests.'}
        </p>
      </CardContent>
    </Card>
  );
}

/** "Every hour" for a schedule trigger's interval setting, from the builder's own options. */
const intervalLabel = (zap: Zap) =>
  actionFields.schedule
    ?.flatMap((f) => f.options ?? [])
    .find((o) => o.value === zap.trigger?.metadata?.interval)?.label ?? 'On a schedule';

const nextRun = (zap: Zap) =>
  zap.enabled && zap.nextRunAt
    ? `Next run ${new Date(zap.nextRunAt).toLocaleString()}`
    : 'Turned off, so no run is planned';

function SchedulePanel({ zap }: { zap: Zap }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>
          {intervalLabel(zap)}. Each run starts on its own; templates can read{' '}
          <code className="font-mono">{'{scheduledFor}'}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="rounded-md bg-muted px-3 py-2 text-sm">{nextRun(zap)}</p>
      </CardContent>
    </Card>
  );
}

/** The trigger's card on the zap page, keyed by trigger id. */
export const triggerPanels: Record<string, ComponentType<{ zap: Zap }>> = {
  webhook: WebhookPanel,
  schedule: SchedulePanel,
};

/** One line about how a zap starts, for dashboard cards; `copy` is offered as a copy button. */
export const triggerSummaries: Record<string, (zap: Zap) => { text: string; copy?: string }> = {
  webhook: (zap) => {
    const url = webhookUrl(zap.userId, zap.id);
    return { text: url, copy: url };
  },
  schedule: (zap) => ({ text: `${intervalLabel(zap)} · ${nextRun(zap)}` }),
};
