import { cn } from '@/lib/cn';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');

interface AvatarProps {
  name?: string;
  /** The user's photo; without one the initials are shown. */
  src?: string | null;
  className?: string;
}

/** The user's photo, or their initials; `name` falls back to "?" while loading. */
export function Avatar({ name, src, className }: AvatarProps) {
  const frame = cn('size-8 shrink-0 rounded-full', className);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- a small data URL from the API, nothing to optimise
    return <img src={src} alt="" aria-hidden className={cn(frame, 'object-cover')} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        frame,
        'flex items-center justify-center bg-primary text-xs font-semibold text-primary-foreground',
      )}
    >
      {name ? initials(name) : '?'}
    </span>
  );
}
