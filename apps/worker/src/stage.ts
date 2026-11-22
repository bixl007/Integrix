import type { JsonObject, JsonValue } from '@integrix/database';
import type { ActionHandler, ActionResult } from './actions/types';
import { retry } from './retry';

export type StepStatus = 'success' | 'failed' | 'halted' | 'skipped';

export interface StepResult {
  status: StepStatus;
  error?: string;
  output?: JsonObject;
}

const MAX_ERROR_LENGTH = 500;

/** Runs one step with retries and reports how it ended; a failing handler becomes a `failed` result, not a throw. */
export async function runStep(
  handler: ActionHandler | undefined,
  metadata: JsonObject,
  payload: JsonValue,
  delaysMs: readonly number[],
  onRetry?: () => Promise<void>,
): Promise<StepResult> {
  if (!handler) return { status: 'skipped' };
  try {
    const result: ActionResult =
      (await retry(() => handler(metadata, payload), delaysMs, onRetry)) || {};
    return { status: result.halt ? 'halted' : 'success', output: result.output };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { status: 'failed', error: message.slice(0, MAX_ERROR_LENGTH) };
  }
}

/** The run's status once a step ends: only a step that passed with more steps left keeps it running. */
export function runStatusAfter(step: StepStatus, isLastStage: boolean) {
  if (step === 'failed' || step === 'halted') return step;
  return isLastStage ? 'success' : 'running';
}
