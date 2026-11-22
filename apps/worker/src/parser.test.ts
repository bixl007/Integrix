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

  test('leaves unknown or unterminated placeholders untouched', () => {
    expect(parse('{missing} and {open', { a: 1 })).toBe('{missing} and {open');
  });
});
