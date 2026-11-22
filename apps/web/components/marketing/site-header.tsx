'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import { GithubIcon } from '@/components/ui/icons';
import { useSession } from '@/lib/session';
import { links } from '@/lib/links';

const sections = [
  { href: '/#features', label: 'Features' },
  { href: '/#integrations', label: 'Integrations' },
  { href: '/#how-it-works', label: 'How it works' },
];

export function SiteHeader() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={links.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source on GitHub"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <GithubIcon />
          </a>
          {/* Auth state is unknown until hydration; render nothing rather than flash the wrong buttons. */}
          {status === 'loading' ? null : status === 'authenticated' ? (
            <Link href="/dashboard" className={buttonVariants({ size: 'sm' })}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
