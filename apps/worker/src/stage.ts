import type { JsonObject, JsonValue } from '@integrix/database';
import type { ActionContext, ActionHandler, ActionResult } from './actions/types';
import { retry } from './retry';

export type StepStatus = 'success' | 'failed' | 'halted' | 'skipped';

export interface StepResult {
  status: StepStatus;
  error?: string;
  output?: JsonObject;
  delayMs?: number;
}

const MAX_ERROR_LENGTH = 500;

/** Runs one step with retries and reports how it ended; a failing handler becomes a `failed` result, not a throw. */
export async function runStep(
  handler: ActionHandler | undefined,
  metadata: JsonObject,
  payload: JsonValue,
  delaysMs: readonly number[],
  onRetry?: () => Promise<void>,
  /** Resolved inside the attempt, so a failure to load it fails the step instead of the message. */
  loadContext: () => Promise<ActionContext> = async () => ({}),
): Promise<StepResult> {
  if (!handler) return { status: 'skipped' };
  try {
    const result: ActionResult =
      (await retry(
        async () => handler(metadata, payload, await loadContext()),
        delaysMs,
        onRetry,
      )) || {};
    return {
      status: result.halt ? 'halted' : 'success',
      output: result.output,
      delayMs: result.delayMs,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { status: 'failed', error: message.slice(0, MAX_ERROR_LENGTH) };
  }
}

/** The run's status once a step ends: a step that passed with more steps left keeps it running, or waiting when it asked for a delay. */
export function runStatusAfter(step: StepStatus, isLastStage: boolean, delayMs?: number) {
  if (step === 'failed' || step === 'halted') return step;
  if (isLastStage) return 'success';
  return delayMs ? 'waiting' : 'running';
}
