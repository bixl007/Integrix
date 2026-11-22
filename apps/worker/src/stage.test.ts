import { expect, test } from 'bun:test';
import { runStatusAfter, runStep } from './stage';

const noDelays: number[] = [];

test('a handler that returns nothing succeeds', async () => {
  expect((await runStep(async () => {}, {}, {}, noDelays)).status).toBe('success');
});

test('output is passed through', async () => {
  const result = await runStep(async () => ({ output: { id: 'abc' } }), {}, {}, noDelays);
  expect(result).toMatchObject({ status: 'success', output: { id: 'abc' } });
});

test('halt ends the step as halted', async () => {
  expect((await runStep(async () => ({ halt: true }), {}, {}, noDelays)).status).toBe('halted');
});

test('a missing handler is skipped', async () => {
  expect(await runStep(undefined, {}, {}, noDelays)).toEqual({ status: 'skipped' });
});

test('a handler that keeps throwing fails after its retries, with a capped error', async () => {
  let calls = 0;
  const result = await runStep(
    async () => {
      calls++;
      throw new Error('x'.repeat(600));
    },
    {},
    {},
    [0, 0],
  );
  expect(calls).toBe(3);
  expect(result.status).toBe('failed');
  expect(result.error).toHaveLength(500);
});

test('a retry that passes counts as success', async () => {
  let calls = 0;
  const result = await runStep(
    async () => {
      if (++calls === 1) throw new Error('flaky');
    },
    {},
    {},
    [0],
  );
  expect(result.status).toBe('success');
});

test('run status follows the step', () => {
  expect(runStatusAfter('success', false)).toBe('running');
  expect(runStatusAfter('success', true)).toBe('success');
  expect(runStatusAfter('skipped', false)).toBe('running');
  expect(runStatusAfter('skipped', true)).toBe('success');
  expect(runStatusAfter('failed', false)).toBe('failed');
  expect(runStatusAfter('halted', false)).toBe('halted');
  expect(runStatusAfter('success', false, 60_000)).toBe('waiting');
  // A delay on the last step has nothing left to wait for.
  expect(runStatusAfter('success', true, 60_000)).toBe('success');
  expect(runStatusAfter('failed', false, 60_000)).toBe('failed');
});

test('a requested delay is passed through', async () => {
  const result = await runStep(async () => ({ delayMs: 5_000 }), {}, {}, noDelays);
  expect(result).toMatchObject({ status: 'success', delayMs: 5_000 });
});
