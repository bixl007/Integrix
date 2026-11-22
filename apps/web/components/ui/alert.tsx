import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Inline status message; `role="alert"` announces errors to screen readers. */
export function Alert({
  variant = 'error',
  className,
  ...props
}: ComponentProps<'div'> & { variant?: 'error' | 'info' }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md border px-3 py-2 text-sm',
        variant === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-border bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
