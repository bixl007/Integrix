import { expect, test } from 'bun:test';
import { firstRunAt, nextRunAfter, scheduleIntervalMs } from './schedule';

const HOUR = 3_600_000;
const at = (ms: number) => new Date(1_700_000_000_000 + ms);

test('reads the interval from trigger settings', () => {
  expect(scheduleIntervalMs({ interval: 'hourly' })).toBe(HOUR);
  expect(scheduleIntervalMs({ interval: 'daily' })).toBe(24 * HOUR);
  expect(scheduleIntervalMs({ interval: 'weekly' })).toBeUndefined();
  expect(scheduleIntervalMs({})).toBeUndefined();
  expect(scheduleIntervalMs(null)).toBeUndefined();
});

test('a new schedule first fires one interval from now', () => {
  expect(firstRunAt({ interval: 'hourly' }, at(0))).toEqual(at(HOUR));
  expect(firstRunAt({}, at(0))).toBeNull();
});

test('the next firing keeps the cadence when the processor is on time', () => {
  expect(nextRunAfter({ interval: 'hourly' }, at(0), at(5_000))).toEqual(at(HOUR));
});

test('missed firings are skipped instead of run in a burst', () => {
  expect(nextRunAfter({ interval: 'hourly' }, at(0), at(5 * HOUR))).toEqual(at(6 * HOUR));
  expect(nextRunAfter({}, at(0), at(0))).toBeNull();
});
