'use client';

import { useState, type ReactNode } from 'react';
import { Logo } from '@/components/logo';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';
import { AppSidebar } from './app-sidebar';

/** Signed-in layout: fixed sidebar on desktop, top bar + drawer on mobile. No marketing footer. */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const close = () => setDrawerOpen(false);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-background-subtle md:block">
        <AppSidebar />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div aria-hidden className="absolute inset-0 bg-black/50" onClick={close} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in border-r border-border bg-background">
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation"
              className="absolute top-4 right-3 rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <CloseIcon />
            </button>
            <AppSidebar onNavigate={close} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <MenuIcon />
          </button>
          <Logo href="/dashboard" />
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
