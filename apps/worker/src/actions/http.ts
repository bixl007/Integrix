import type { JsonValue } from '@integrix/database';
import { request } from '../http';
import { parse } from '../parser';
import type { ActionHandler } from './types';

/** Reads "Name: value" lines into headers; a line without a colon is a mistake worth failing on. */
export function parseHeaders(text: string) {
  const headers: Record<string, string> = {};
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const colon = line.indexOf(':');
    if (colon < 1) throw new Error('Each header must be written as "Name: value" on its own line');
    headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return headers;
}

/** Sends a templated request to a public URL; the response is the step's output. */
export const httpAction: ActionHandler = async (metadata, payload) => {
  const method = String(metadata.method || 'GET').toUpperCase();
  const url = parse(String(metadata.url ?? ''), payload).trim();
  const headers = parseHeaders(parse(String(metadata.headers ?? ''), payload));
  const body = parse(String(metadata.body ?? ''), payload);
  const hasType = Object.keys(headers).some((name) => name.toLowerCase() === 'content-type');
  if (body && !hasType) headers['Content-Type'] = 'application/json';

  const response = await request(url, { method, headers, body: body || undefined });
  let parsed: JsonValue = response.body;
  try {
    // A JSON response is stored as JSON so later steps can read {steps.N.body.field}.
    parsed = JSON.parse(response.body) as JsonValue;
  } catch {
    // Not JSON: keep the text.
  }
  return { output: { status: response.status, body: parsed } };
};
