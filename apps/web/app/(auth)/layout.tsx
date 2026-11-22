import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';
import { ArrowLeftIcon } from '@/components/ui/icons';

// Focused layout: logo + form, no marketing nav or footer.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background-subtle">
      <header className="relative flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon /> Home
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 pb-24">
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
