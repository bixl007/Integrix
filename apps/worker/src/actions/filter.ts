import { parse } from '../parser';
import type { ActionHandler } from './types';

// Keyed by the `operator` setting; the builder offers the same ids.
export const filterOperators: Record<string, (value: string, compare: string) => boolean> = {
  equals: (value, compare) => value === compare,
  not_equals: (value, compare) => value !== compare,
  contains: (value, compare) => value.includes(compare),
  not_contains: (value, compare) => !value.includes(compare),
  greater_than: (value, compare) => Number(value) > Number(compare),
  less_than: (value, compare) => Number(value) < Number(compare),
  is_empty: (value) => value === '',
  is_not_empty: (value) => value !== '',
};

/** Halts the run unless the condition holds. A missing field counts as empty text. */
export const filterAction: ActionHandler = async (metadata, payload) => {
  const operator = filterOperators[String(metadata.operator ?? '')];
  if (!operator) throw new Error(`Unknown filter operator "${String(metadata.operator)}"`);
  const value = parse(String(metadata.field ?? ''), payload, '').trim();
  const compare = parse(String(metadata.value ?? ''), payload, '').trim();
  const passed = operator(value, compare);
  return { halt: !passed, output: { passed } };
};
