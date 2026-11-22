import type { JsonObject, JsonValue } from '@integrix/database';

interface StepOutput {
  stage: number;
  status: string;
  output: JsonValue;
}

const isObject = (value: JsonValue | undefined): value is JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Template values for a stage: the request body plus earlier step outputs under `steps.<step number>`. */
export function templateContext(payload: JsonValue, steps: readonly StepOutput[], stage: number) {
  // An array body (some senders post a list of events) is read by position: {0.signature}.
  const body: JsonObject = isObject(payload)
    ? payload
    : Array.isArray(payload)
      ? Object.fromEntries(payload.entries())
      : {};
  const outputs: JsonObject = {};
  for (const step of steps) {
    // Steps are numbered like the UI: the trigger is step 1, so stage 0 is step 2.
    if (step.stage < stage && step.status === 'success' && isObject(step.output)) {
      outputs[String(step.stage + 2)] = step.output;
    }
  }
  // A body with its own `steps` object keeps its keys; step numbers win on a clash.
  return { ...body, steps: { ...(isObject(body.steps) ? body.steps : {}), ...outputs } };
}
