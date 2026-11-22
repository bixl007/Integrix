import { expect, test } from 'bun:test';
import { fieldPaths, fieldSuggestions } from './field-paths';

test('lists nested values, treating arrays as one value', () => {
  expect(fieldPaths({ name: 'Ada', user: { email: 'a@b.co' }, cart: ['pen'] })).toEqual([
    'name',
    'user.email',
    'cart',
  ]);
});

test('skips keys a placeholder cannot address and stops at four levels', () => {
  expect(fieldPaths({ 'a.b': 1, '{x}': 2, ok: 3 })).toEqual(['ok']);
  expect(fieldPaths({ a: { b: { c: { d: { e: 1 } } } } })).toEqual(['a.b.c.d']);
  expect(fieldPaths('text')).toEqual([]);
});

const sample = {
  payload: { name: 'Ada' },
  steps: [
    { stage: 0, output: { signature: 'abc' } },
    { stage: 1, output: null },
    { stage: 2, output: { to: 'a@b.co' } },
  ],
};

test('suggests request fields, then outputs of earlier steps only', () => {
  expect(fieldSuggestions(sample, 0)).toEqual(['{name}']);
  expect(fieldSuggestions(sample, 2)).toEqual(['{name}', '{steps.2.signature}']);
  expect(fieldSuggestions(sample, 3)).toEqual(['{name}', '{steps.2.signature}', '{steps.4.to}']);
});

test('no sample means no suggestions, and the list is capped', () => {
  expect(fieldSuggestions(null, 1)).toEqual([]);
  const wide = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`f${i}`, i]));
  expect(fieldSuggestions({ payload: wide, steps: [] }, 0)).toHaveLength(40);
});
