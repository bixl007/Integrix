import { expect, test } from 'bun:test';
import { filterAction, filterOperators } from './filter';

const run = (operator: string, value: string, payload = { total: '150', plan: 'pro team' }) =>
  filterAction({ field: '{total}', operator, value }, payload);

test('a passing condition lets the run continue', async () => {
  expect(await run('greater_than', '100')).toEqual({ halt: false, output: { passed: true } });
});

test('a failing condition halts the run', async () => {
  expect(await run('less_than', '100')).toEqual({ halt: true, output: { passed: false } });
});

test('compares text and numbers', () => {
  expect(filterOperators.equals('a', 'a')).toBe(true);
  expect(filterOperators.not_equals('a', 'a')).toBe(false);
  expect(filterOperators.contains('pro team', 'pro')).toBe(true);
  expect(filterOperators.not_contains('pro team', 'pro')).toBe(false);
  expect(filterOperators.greater_than('9', '10')).toBe(false);
  expect(filterOperators.less_than('9', '10')).toBe(true);
  // Text that is not a number never passes a numeric comparison.
  expect(filterOperators.greater_than('abc', '1')).toBe(false);
});

test('a missing field is empty, and the compare value can be a template', async () => {
  const empty = await filterAction({ field: '{nope}', operator: 'is_empty', value: '' }, {});
  expect(empty).toEqual({ halt: false, output: { passed: true } });
  const same = await filterAction(
    { field: '{plan}', operator: 'equals', value: '{wanted}' },
    { plan: 'pro', wanted: 'pro' },
  );
  expect(same).toEqual({ halt: false, output: { passed: true } });
});

test('an unknown operator fails the step', async () => {
  await expect(run('matches', 'x')).rejects.toThrow('Unknown filter operator "matches"');
});
