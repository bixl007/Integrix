import type { JsonObject, JsonValue } from '@integrix/database';

/** What a step reports back: `output` is stored on the run's step, `halt` ends the run without an error. */
export interface ActionResult {
  output?: JsonObject;
  halt?: boolean;
}

/** Runs one action step; `metadata` holds templates, `payload` is the webhook body. Throw to fail the step. */
export type ActionHandler = (
  metadata: JsonObject,
  payload: JsonValue,
) => Promise<ActionResult | void>;
