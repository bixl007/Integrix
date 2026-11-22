import type { ComponentProps } from 'react';
import type { Badge } from '@/components/ui/badge';

interface StatusInfo {
  label: string;
  variant: NonNullable<ComponentProps<typeof Badge>['variant']>;
}

// Run and step statuses written by the worker, keyed by the stored value.
const statuses: Record<string, StatusInfo> = {
  queued: { label: 'Queued', variant: 'neutral' },
  running: { label: 'Running', variant: 'accent' },
  success: { label: 'Success', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  halted: { label: 'Halted', variant: 'neutral' },
  skipped: { label: 'Skipped', variant: 'neutral' },
  unknown: { label: 'Not recorded', variant: 'neutral' },
};

export const statusInfo = (status: string): StatusInfo =>
  statuses[status] ?? { label: status, variant: 'neutral' };

/** "0.8s" under a minute, "2m 5s" above; undefined while the end time is missing. */
export function formatDuration(start: string, end: string | null) {
  if (!end) return undefined;
  const ms = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
