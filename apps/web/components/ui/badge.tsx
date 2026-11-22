import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  neutral: 'border-border bg-muted text-muted-foreground',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  success: 'border-success/30 bg-success/10 text-success',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
} as const;

export function Badge({
  variant = 'neutral',
  className,
  ...props
}: ComponentProps<'span'> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
