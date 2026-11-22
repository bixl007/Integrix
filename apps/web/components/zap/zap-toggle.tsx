'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import type { Zap } from '@/lib/types';

/** Turns a zap on or off; `onChange` runs after the server confirms. */
export function ZapToggle({
  zap,
  onChange,
}: {
  zap: Pick<Zap, 'id' | 'enabled'>;
  onChange: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function toggle(enabled: boolean) {
    setPending(true);
    setError(undefined);
    try {
      await api(`/zap/${zap.id}`, { method: 'PATCH', body: { enabled } });
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the zap');
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
      <Switch
        checked={zap.enabled}
        onChange={toggle}
        disabled={pending}
        label={zap.enabled ? 'Zap is on, turn it off' : 'Zap is off, turn it on'}
      />
    </span>
  );
}
