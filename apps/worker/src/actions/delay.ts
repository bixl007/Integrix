import { parse } from '../parser';
import type { ActionHandler } from './types';

// Keyed by the `unit` setting; the builder offers the same ids.
const unitMs: Record<string, number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};
const MAX_DELAY_MS = 30 * 86_400_000;

/** Asks the worker to resume the run later. Nothing sleeps: the next stage waits in the outbox. */
export const delayAction: ActionHandler = async (metadata, payload) => {
  const amount = Number(parse(String(metadata.amount ?? ''), payload, '').trim() || NaN);
  const unit = unitMs[String(metadata.unit ?? '')];
  if (!unit) throw new Error(`Unknown delay unit "${String(metadata.unit)}"`);
  const delayMs = Math.round(amount * unit);
  if (!(delayMs > 0) || delayMs > MAX_DELAY_MS) {
    throw new Error('Delay must be more than 0 and at most 30 days');
  }
  return { delayMs, output: { resumeAt: new Date(Date.now() + delayMs).toISOString() } };
};
