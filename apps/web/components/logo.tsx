import Link from 'next/link';
import { cn } from '@/lib/cn';
import { LogoIcon } from './ui/icons';

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <LogoIcon className="size-4" />
      </span>
      Integrix
    </Link>
  );
}
