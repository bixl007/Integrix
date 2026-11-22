import { expect, test } from 'bun:test';
import { formatDuration, statusInfo } from './run-format';

const at = (ms: number) => new Date(1_700_000_000_000 + ms).toISOString();

test('formats seconds and minutes', () => {
  expect(formatDuration(at(0), at(840))).toBe('0.8s');
  expect(formatDuration(at(0), at(16_400))).toBe('16.4s');
  expect(formatDuration(at(0), at(125_000))).toBe('2m 5s');
});

test('has no duration for an unfinished run and never goes negative', () => {
  expect(formatDuration(at(0), null)).toBeUndefined();
  expect(formatDuration(at(500), at(0))).toBe('0.0s');
});

test('an unknown status falls back to its raw value', () => {
  expect(statusInfo('failed')).toEqual({ label: 'Failed', variant: 'danger' });
  expect(statusInfo('paused')).toEqual({ label: 'paused', variant: 'neutral' });
});
