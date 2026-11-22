import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type SwitchProps = Omit<ComponentProps<'button'>, 'onChange'> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name, e.g. "Zap is on". */
  label: string;
};

/** On/off toggle: a `role="switch"` button, so Space and Enter work without extra handlers. */
export function Switch({ checked, onChange, label, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border p-0.5 transition-colors disabled:pointer-events-none disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'size-4.5 rounded-full transition-transform',
          checked ? 'translate-x-5 bg-primary-foreground' : 'bg-muted-foreground',
        )}
      />
    </button>
  );
}
