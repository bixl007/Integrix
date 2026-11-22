import { cn } from '@/lib/cn';
import { CopyButton } from './copy-button';

/** Preformatted code with a copy button in the corner. */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <pre className="overflow-x-auto rounded-md border border-border bg-background-subtle p-4 pr-24 font-mono text-xs leading-relaxed text-foreground">
        {code}
      </pre>
      <CopyButton value={code} variant="ghost" className="absolute top-2 right-2" />
    </div>
  );
}
