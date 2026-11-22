/** The latest request of a zap and the outputs of its steps (`GET /zap/:id/sample`). */
export interface ZapSample {
  payload: unknown;
  steps: { stage: number; output: unknown }[];
}

const MAX_FIELDS = 40;
const MAX_DEPTH = 4;
// A key with these characters can't be written as a `{dotted.path}` placeholder.
const UNADDRESSABLE = /[.{}]/;

/** Dotted paths to the values in `value`. An array is one value: templates insert it as JSON. */
export function fieldPaths(value: unknown, prefix = '', depth = 0): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || depth >= MAX_DEPTH) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value)
    .filter(([key]) => !UNADDRESSABLE.test(key))
    .flatMap(([key, child]) => fieldPaths(child, prefix ? `${prefix}.${key}` : key, depth + 1));
}

/** Placeholders the action at `position` can use: the latest request's fields, then earlier steps' outputs. */
export function fieldSuggestions(sample: ZapSample | null | undefined, position: number): string[] {
  if (!sample) return [];
  const paths = [
    ...fieldPaths(sample.payload),
    ...sample.steps
      .filter((s) => s.stage < position && s.output)
      // Steps are numbered like the flow: the trigger is step 1, so stage 0 is step 2.
      .flatMap((s) => fieldPaths(s.output, `steps.${s.stage + 2}`)),
  ];
  return paths.slice(0, MAX_FIELDS).map((path) => `{${path}}`);
}
