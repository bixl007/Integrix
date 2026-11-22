import type { Zap } from '@/lib/types';

/** The step chain, e.g. "Webhook → Email"; the title of a zap without a custom name. */
export const stepsTitle = (zap: Zap) =>
  [zap.trigger?.type.name ?? 'Unknown', ...zap.actions.map((a) => a.type.name)].join(' → ');

export const zapTitle = (zap: Zap) => zap.name ?? stepsTitle(zap);
