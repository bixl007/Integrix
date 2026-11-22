import Link from 'next/link';
import { CopyButton } from '@/components/ui/copy-button';
import { ArrowRightIcon } from '@/components/ui/icons';
import { webhookUrl } from '@/lib/config';
import type { Zap } from '@/lib/types';
import { IntegrationIcon } from './integration-icon';

export const zapTitle = (zap: Zap) =>
  [zap.trigger?.type.name ?? 'Unknown', ...zap.actions.map((a) => a.type.name)].join(' → ');

export function ZapCard({ zap }: { zap: Zap }) {
  const url = webhookUrl(zap.userId, zap.id);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-foreground before:opacity-0 before:transition-opacity hover:border-border-strong hover:before:opacity-100">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center gap-1.5">
          {zap.trigger && <IntegrationIcon integration={zap.trigger.type} />}
          {zap.actions.map((a) => (
            <IntegrationIcon key={a.id} integration={a.type} />
          ))}
        </div>
        <div>
          <h3 className="truncate font-medium">
            {/* Stretched link: the whole card is clickable, inner buttons stay separate. */}
            <Link href={`/zap/${zap.id}`} className="after:absolute after:inset-0">
              {zapTitle(zap)}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {zap.actions.length} action{zap.actions.length === 1 ? '' : 's'} · Created{' '}
            {new Date(zap.createdAt).toLocaleDateString()}
          </p>
        </div>
        <p
          className="truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground"
          title={url}
        >
          {url}
        </p>
      </div>
      <div className="relative flex items-center justify-between border-t border-border px-5 py-3">
        <CopyButton value={url} label="Copy URL" variant="ghost" />
        <ArrowRightIcon className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </article>
  );
}
