import { cn } from '@/lib/cn';
import type { Integration } from '@/lib/types';
import { IntegrationIcon } from './integration-icon';

interface StepNodeProps {
  label: string;
  index: number;
  integration?: Integration;
  detail?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

/** One step in the vertical flow; clickable when editable. */
export function StepNode({ label, index, integration, detail, onClick, onRemove }: StepNodeProps) {
  const Body = onClick ? 'button' : 'div';
  return (
    <div className="group relative w-full max-w-md">
      <Body
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border bg-background p-4 text-left',
          integration ? 'border-border' : 'border-dashed border-border-strong',
          onClick && 'transition-colors hover:border-foreground/30 hover:bg-background-subtle',
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
          {index}
        </span>
        {integration && <IntegrationIcon integration={integration} />}
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground uppercase">{label}</span>
          <span className="block truncate text-sm font-medium">
            {integration?.name ?? `Select ${label.toLowerCase()}`}
          </span>
          {detail && (
            <span className="block truncate font-mono text-xs text-muted-foreground">{detail}</span>
          )}
        </span>
      </Body>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove step ${index}`}
          className="absolute top-2 right-2 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-muted hover:text-destructive"
        >
          Remove
        </button>
      )}
    </div>
  );
}

/** Vertical link between steps; `animated` sends a light beam down it. */
export function StepConnector({ animated = false }: { animated?: boolean }) {
  return (
    <div aria-hidden className="relative h-6 w-px overflow-hidden bg-border-strong">
      {animated && (
        <span className="absolute inset-0 animate-flow bg-gradient-to-b from-transparent via-foreground/60 to-transparent" />
      )}
    </div>
  );
}
