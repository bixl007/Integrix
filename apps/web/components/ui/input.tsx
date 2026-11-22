'use client';

import { useId, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from './icons';

export const fieldClasses =
  'w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-border-strong focus:border-foreground/40 focus:outline-none disabled:opacity-50 aria-invalid:border-destructive';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
}

/** Label, control and hint/error wired together with ids for screen readers. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {(error ?? hint) && (
        <p
          id={`${id}-desc`}
          className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  hint,
  error,
  type = 'text',
  className,
  ...props
}: FieldProps & ComponentProps<'input'>) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-desc` : undefined}
          className={cn(fieldClasses, 'h-10', isPassword && 'pr-10', className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps & ComponentProps<'textarea'>) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? `${id}-desc` : undefined}
        className={cn(fieldClasses, 'min-h-24 py-2', className)}
        {...props}
      />
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps & ComponentProps<'select'>) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        {/* The native arrow is replaced so the text and arrow sit on the same gutters as an Input. */}
        <select
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-desc` : undefined}
          className={cn(fieldClasses, 'h-10 cursor-pointer appearance-none pr-9', className)}
          {...props}
        />
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
      </div>
    </Field>
  );
}
