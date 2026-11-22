import type { Mail } from '@integrix/mailer';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3001';

interface FailedRun {
  to: string;
  zapId: string;
  zapName: string | null;
  /** 0-based action stage; the UI numbers the trigger as step 1. */
  stage: number;
  actionName: string;
  attempts: number;
  error?: string;
}

/** The email telling a zap's owner that a run failed, with a link to its history. */
export function failureMail(run: FailedRun): Mail {
  const step = `step ${run.stage + 2} (${run.actionName})`;
  const zap = run.zapName ? `zap "${run.zapName}"` : 'zap';
  return {
    to: run.to,
    subject: `Your ${zap} failed at ${step}`,
    text: [
      `A run of your ${zap} stopped at ${step} after ${run.attempts} attempts. Later steps did not run.`,
      `Error: ${run.error ?? 'Unknown error'}`,
      `Run history: ${WEB_URL}/zap/${run.zapId}?tab=history`,
    ].join('\n\n'),
  };
}
