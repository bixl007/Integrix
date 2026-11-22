import type { JsonValue } from '@integrix/database';

const PLACEHOLDER = /\{([^{}]+)\}/g;

/** Walks a dotted path like `user.email`; JSON strings are parsed on the way down. */
function resolve(values: JsonValue, path: string): JsonValue | undefined {
  let current: JsonValue | undefined = values;
  for (const key of path.split('.')) {
    if (typeof current === 'string') {
      try {
        current = JSON.parse(current) as JsonValue;
      } catch {
        return undefined;
      }
    }
    if (current === null || typeof current !== 'object' || Array.isArray(current)) return undefined;
    current = current[key];
  }
  return current;
}

/** Replaces `{path}` placeholders with payload values; unknown paths are left as-is. */
export function parse(text: string, values: JsonValue): string {
  return text.replace(PLACEHOLDER, (match, path: string) => {
    const value = resolve(values, path.trim());
    if (value === undefined) return match;
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
}
