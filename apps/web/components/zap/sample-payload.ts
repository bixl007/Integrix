// Same placeholder syntax as the worker's parser (apps/worker/src/parser.ts).
const PLACEHOLDER = /\{([^{}]+)\}/g;
const STEP_OUTPUT = /^steps\.\d+(\.|$)/;
const FIELD_PATH = /^[\w$-]+(\.[\w$-]+)*$/;

export interface SamplePayload {
  [key: string]: string | SamplePayload;
}

/** An example webhook body with a `<field>` value for every placeholder the templates read. */
export function samplePayload(templates: string[]): SamplePayload {
  const payload: SamplePayload = {};
  for (const text of templates) {
    for (const [, path] of text.matchAll(PLACEHOLDER)) {
      // Skip a flat JSON object in an HTTP body (not a field path) and step outputs (not in the request).
      if (!FIELD_PATH.test(path.trim()) || STEP_OUTPUT.test(path.trim())) continue;
      const keys = path.trim().split('.');
      const leaf = keys.pop() ?? '';
      let node = payload;
      for (const key of keys) {
        const next = node[key];
        // A nested path wins over an earlier flat value with the same key.
        node = typeof next === 'object' ? next : (node[key] = {});
      }
      if (!(leaf in node)) node[leaf] = `<${leaf}>`;
    }
  }
  return payload;
}

/** A copy-pasteable curl that POSTs `payload` as JSON; single quotes are shell-escaped. */
export const webhookCurl = (url: string, payload: unknown) =>
  `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(payload).replaceAll("'", "'\\''")}'`;
