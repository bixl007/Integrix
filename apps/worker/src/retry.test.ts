import { describe, expect, test } from 'bun:test';
import { retry } from './retry';

const failingTimes = (failures: number) => {
  let calls = 0;
  const task = async () => {
    calls++;
    if (calls <= failures) throw new Error(`fail ${calls}`);
    return 'ok';
  };
  return { task, calls: () => calls };
};

describe('retry', () => {
  test('returns once the task succeeds within the allowed retries', async () => {
    const { task, calls } = failingTimes(2);
    let retries = 0;
    expect(await retry(task, [0, 0], async () => void retries++)).toBe('ok');
    expect(calls()).toBe(3);
    expect(retries).toBe(2);
  });

  test('rethrows the last error after the delays run out', async () => {
    const { task, calls } = failingTimes(5);
    await expect(retry(task, [0, 0])).rejects.toThrow('fail 3');
    expect(calls()).toBe(3);
  });
});
