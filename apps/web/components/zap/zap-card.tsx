import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { ArrowRightIcon } from '@/components/ui/icons';
import type { Zap } from '@/lib/types';
import { IntegrationIcon } from './integration-icon';
import { triggerSummaries } from './trigger-panels';
import { ZapActions } from './zap-actions';
import { zapTitle } from './zap-title';

/** Dashboard card; `onChange` runs after the zap is renamed or deleted. */
export function ZapCard({ zap, onChange }: { zap: Zap; onChange: () => void }) {
  const summary = triggerSummaries[zap.trigger?.type.id ?? '']?.(zap);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-foreground before:opacity-0 before:transition-opacity hover:border-border-strong hover:before:opacity-100">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center gap-1.5">
          {zap.trigger && <IntegrationIcon integration={zap.trigger.type} />}
          {zap.actions.map((a) => (
            <IntegrationIcon key={a.id} integration={a.type} />
          ))}
          {!zap.enabled && <Badge className="ml-auto">Off</Badge>}
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
        {summary && (
          <p
            className="truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground"
            title={summary.text}
          >
            {summary.text}
          </p>
        )}
      </div>
      {/* Only the controls are positioned, so the rest of the footer opens the zap. */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        {summary?.copy ? (
          <CopyButton value={summary.copy} label="Copy URL" variant="ghost" className="relative" />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <ZapActions zap={zap} onRenamed={onChange} onDeleted={onChange} side="top" />
          {/* A real link: the hover transform would lift a plain icon above the stretched link. */}
          <Link
            href={`/zap/${zap.id}`}
            aria-label={`Open ${zapTitle(zap)}`}
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'relative' })}
          >
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
