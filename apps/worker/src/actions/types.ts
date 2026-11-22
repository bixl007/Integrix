import type { JsonObject, JsonValue } from '@integrix/database';

/** What a step reports back: `output` is stored on the run's step, `halt` ends the run without an error. */
export interface ActionResult {
  output?: JsonObject;
  halt?: boolean;
  /** Wait this long before the next step; the worker parks the next stage in the outbox. */
  delayMs?: number;
}

/** What the worker resolves for a step before running it. */
export interface ActionContext {
  /** The decrypted values of the user's connection the step points at, when it has one. */
  connection?: Record<string, string>;
}

/**
 * Runs one action step. `metadata` holds templates, `payload` is the request body plus earlier
 * step outputs under `steps`. Throw to fail the step.
 */
export type ActionHandler = (
  metadata: JsonObject,
  payload: JsonValue,
  context?: ActionContext,
) => Promise<ActionResult | void>;
