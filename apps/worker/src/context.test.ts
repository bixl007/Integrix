import { expect, test } from 'bun:test';
import { templateContext } from './context';
import { parse } from './parser';

const steps = [
  { stage: 0, status: 'success', output: { signature: 'abc' } },
  { stage: 1, status: 'failed', output: { ignored: true } },
  { stage: 2, status: 'success', output: null },
  { stage: 3, status: 'success', output: { later: true } },
];

test('adds earlier successful outputs under their UI step number', () => {
  const context = templateContext({ name: 'Ada' }, steps, 3);
  expect(context).toEqual({ name: 'Ada', steps: { '2': { signature: 'abc' } } });
  expect(parse('{name} {steps.2.signature} {steps.5.later}', context)).toBe(
    'Ada abc {steps.5.later}',
  );
});

test('the first stage sees only the body', () => {
  expect(templateContext({ name: 'Ada' }, steps, 0)).toEqual({ name: 'Ada', steps: {} });
});

test("keeps a body's own steps object and tolerates a body that is not an object", () => {
  expect(templateContext({ steps: { count: 3 } }, steps, 1)).toEqual({
    steps: { count: 3, '2': { signature: 'abc' } },
  });
  expect(templateContext([1, 2], steps, 1)).toEqual({ steps: { '2': { signature: 'abc' } } });
});
