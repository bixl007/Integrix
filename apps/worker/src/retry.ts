const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `task`, waiting each delay in turn before retrying; rethrows the last error when they run out. */
export async function retry<T>(
  task: () => Promise<T>,
  delaysMs: readonly number[],
  onRetry: () => Promise<void> = async () => {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (e) {
      if (attempt >= delaysMs.length) throw e;
      await sleep(delaysMs[attempt]);
      await onRetry();
    }
  }
}
