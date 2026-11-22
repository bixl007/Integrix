import { describe, expect, test } from 'bun:test';
import { parse } from './parser';

describe('parse', () => {
  test('replaces flat and nested placeholders', () => {
    const payload = { name: 'Sam', amount: 0.1, user: { email: 'a@b.co' } };
    expect(parse('Hi {name}, sent {amount} to {user.email}', payload)).toBe(
      'Hi Sam, sent 0.1 to a@b.co',
    );
  });

  test('reads through JSON-encoded string values', () => {
    expect(parse('{user.email}', { user: '{"email":"x@y.z"}' })).toBe('x@y.z');
  });

  test('uses the replacement for missing and null values when one is given', () => {
    expect(parse('[{missing}][{empty}][{a}]', { a: 1, empty: null }, '')).toBe('[][][1]');
  });

  test('reads earlier step outputs like any nested value', () => {
    expect(parse('{steps.2.signature}', { steps: { '2': { signature: 'abc' } } })).toBe('abc');
  });

  test('reads array items by position', () => {
    const payload = { items: [{ name: 'pen' }, { name: 'ink' }] };
    expect(parse('{items.1.name} {items.0.name} {items.5.name} {items.x}', payload)).toBe(
      'ink pen {items.5.name} {items.x}',
    );
  });

  test('leaves unknown or unterminated placeholders untouched', () => {
    expect(parse('{missing} and {open', { a: 1 })).toBe('{missing} and {open');
  });
});
