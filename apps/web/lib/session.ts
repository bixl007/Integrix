'use client';

import { useSyncExternalStore } from 'react';
import { api, UNAUTHORIZED_EVENT } from './api';
import type { User } from './types';

export type Session =
  { status: 'loading' } | { status: 'authenticated'; user: User } | { status: 'unauthenticated' };

// One shared store: every component reads the same session from a single request.
let session: Session = { status: 'loading' };
let started = false;
const listeners = new Set<() => void>();

function setSession(next: Session) {
  session = next;
  listeners.forEach((l) => l());
}

/** Re-reads the session cookie from the API (call after login). */
export async function refreshSession() {
  try {
    const { user } = await api<{ user: User | null }>('/auth/session');
    setSession(user ? { status: 'authenticated', user } : { status: 'unauthenticated' });
  } catch {
    setSession({ status: 'unauthenticated' });
  }
}

export async function signOut() {
  await api('/user/logout', { method: 'POST' }).catch(() => {});
  setSession({ status: 'unauthenticated' });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    window.addEventListener(UNAUTHORIZED_EVENT, () => setSession({ status: 'unauthenticated' }));
    void refreshSession();
  }
  return () => listeners.delete(listener);
}

const serverSnapshot: Session = { status: 'loading' };

export function useSession(): Session {
  return useSyncExternalStore(
    subscribe,
    () => session,
    () => serverSnapshot,
  );
}
