import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/app-shell';
import { RequireAuth } from '@/components/require-auth';

export const metadata: Metadata = { title: 'Dashboard' };

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
