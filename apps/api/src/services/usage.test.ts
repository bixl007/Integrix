import { expect, test } from 'bun:test';
import { fillMonths, monthStart } from './usage';

const now = new Date('2026-02-15T10:00:00Z');

test('month starts are in UTC and cross year boundaries', () => {
  expect(monthStart(now, 0).toISOString()).toBe('2026-02-01T00:00:00.000Z');
  expect(monthStart(now, 3).toISOString()).toBe('2025-11-01T00:00:00.000Z');
});

test('fills the window oldest first, with zero for quiet months', () => {
  const rows = [
    { month: '2026-02', steps: 7 },
    { month: '2025-12', steps: 3 },
    { month: '2025-01', steps: 99 },
  ];
  expect(fillMonths(rows, now, 4)).toEqual([
    { month: '2025-11', steps: 0 },
    { month: '2025-12', steps: 3 },
    { month: '2026-01', steps: 0 },
    { month: '2026-02', steps: 7 },
  ]);
});
