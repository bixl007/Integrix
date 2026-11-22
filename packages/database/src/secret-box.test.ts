import { expect, test } from 'bun:test';
import { connectionKey, seal, unseal } from './secret-box';

const key = connectionKey('test-secret')!;

test('a sealed value opens with the same key', () => {
  const sealed = seal('{"appPassword":"abcd efgh"}', key);
  expect(sealed).not.toContain('abcd');
  expect(unseal(sealed, key)).toBe('{"appPassword":"abcd efgh"}');
});

test('sealing twice gives different text, so equal secrets are not recognisable', () => {
  expect(seal('same', key)).not.toBe(seal('same', key));
});

test('a wrong key or altered text is refused', () => {
  const sealed = seal('secret', key);
  expect(() => unseal(sealed, connectionKey('other')!)).toThrow();
  const [iv, tag, data] = sealed.split('.');
  expect(() => unseal([iv, tag, `${data}AA`].join('.'), key)).toThrow();
  expect(() => unseal('plain text', key)).toThrow();
});

test('there is no key without CONNECTION_SECRET', () => {
  expect(connectionKey('')).toBeUndefined();
  expect(connectionKey('x')).toHaveLength(32);
});
