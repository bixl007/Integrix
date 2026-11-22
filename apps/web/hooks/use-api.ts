'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface State<T> {
  path: string | null;
  data?: T;
  error?: string;
}

/** GETs `path` on mount, when it changes and on `reload()`; pass null to skip. Aborts stale requests. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ path: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    api<T>(path, { signal: controller.signal })
      .then((data) => setState({ path, data }))
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          setState({ path, error: e instanceof Error ? e.message : 'Request failed' });
        }
      });
    return () => controller.abort();
  }, [path, version]);

  // Derived so a new path never shows the previous path's data.
  const current = state.path === path;
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: path !== null && !current,
    // Keeps showing the current data until the refetch lands.
    reload: () => setVersion((v) => v + 1),
  };
}
