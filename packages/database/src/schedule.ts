import type { JsonValue } from '@prisma/client/runtime/library';

// Keyed by a trigger's `interval` setting; the builder offers the same ids.
export const scheduleIntervals: Record<string, number> = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
};

/** The interval in a trigger's settings, in ms; undefined when the trigger has no schedule. */
export function scheduleIntervalMs(metadata: JsonValue | undefined): number | undefined {
  if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }
  return typeof metadata.interval === 'string' ? scheduleIntervals[metadata.interval] : undefined;
}

/** First firing of a schedule that starts (or is switched back on) at `now`; null without a schedule. */
export function firstRunAt(metadata: JsonValue | undefined, now: Date): Date | null {
  const interval = scheduleIntervalMs(metadata);
  return interval === undefined ? null : new Date(now.getTime() + interval);
}

/** Firing after the one that was due at `due`. Firings missed while the processor was down are skipped. */
export function nextRunAfter(metadata: JsonValue | undefined, due: Date, now: Date): Date | null {
  const interval = scheduleIntervalMs(metadata);
  if (interval === undefined) return null;
  const next = due.getTime() + interval;
  return new Date(next > now.getTime() ? next : now.getTime() + interval);
}
