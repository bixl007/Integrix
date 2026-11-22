import type { JsonValue } from '@prisma/client/runtime/library';

/** One step of a run: the connector id, its display name and its settings. */
export type RunAction = { actionId: string; name: string; metadata: Record<string, string> };

interface ZapAction {
  sortingOrder: number;
  metadata: JsonValue;
  type: { id: string; name: string };
}

/** Copies a zap's actions in run order, so a run keeps its steps when the zap is edited later. */
export const snapshotActions = (actions: readonly ZapAction[]): RunAction[] =>
  actions
    .toSorted((a, b) => a.sortingOrder - b.sortingOrder)
    .map((a) => ({
      actionId: a.type.id,
      name: a.type.name,
      // The API only stores flat string maps as action metadata.
      metadata: (a.metadata ?? {}) as Record<string, string>,
    }));

/** Reads `ZapRun.actions`; undefined when the run has no usable snapshot. */
export function readRunActions(value: JsonValue | undefined): RunAction[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const actions: RunAction[] = [];
  for (const item of value) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) return undefined;
    const { actionId, name, metadata } = item;
    if (typeof actionId !== 'string' || typeof name !== 'string') return undefined;
    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return undefined;
    }
    actions.push({ actionId, name, metadata: metadata as Record<string, string> });
  }
  return actions;
}
