import { expect, test } from 'bun:test';
import { delayAction } from './delay';

test('converts the amount and unit to milliseconds', async () => {
  expect((await delayAction({ amount: '5', unit: 'minutes' }, {}))?.delayMs).toBe(300_000);
  expect((await delayAction({ amount: '1.5', unit: 'hours' }, {}))?.delayMs).toBe(5_400_000);
  expect((await delayAction({ amount: '{wait}', unit: 'days' }, { wait: 2 }))?.delayMs).toBe(
    172_800_000,
  );
});

test('reports when the run resumes', async () => {
  const before = Date.now();
  const result = await delayAction({ amount: '1', unit: 'minutes' }, {});
  const resumeAt = new Date(String(result?.output?.resumeAt)).getTime();
  expect(resumeAt).toBeGreaterThanOrEqual(before + 60_000);
});

test('rejects a missing, zero, negative, non-numeric or too long delay and an unknown unit', async () => {
  const limit = 'Delay must be more than 0 and at most 30 days';
  await expect(delayAction({ amount: '', unit: 'minutes' }, {})).rejects.toThrow(limit);
  await expect(delayAction({ amount: '0', unit: 'minutes' }, {})).rejects.toThrow(limit);
  await expect(delayAction({ amount: '-1', unit: 'hours' }, {})).rejects.toThrow(limit);
  await expect(delayAction({ amount: 'soon', unit: 'hours' }, {})).rejects.toThrow(limit);
  await expect(delayAction({ amount: '{missing}', unit: 'hours' }, {})).rejects.toThrow(limit);
  await expect(delayAction({ amount: '31', unit: 'days' }, {})).rejects.toThrow(limit);
  await expect(delayAction({ amount: '1', unit: 'weeks' }, {})).rejects.toThrow(
    'Unknown delay unit "weeks"',
  );
});
