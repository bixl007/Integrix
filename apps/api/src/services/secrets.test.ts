import { expect, test } from 'bun:test';
import { maskSecrets, restoreSecrets, SECRET_MASK } from './secrets';

const secretFields = ['botToken'];

test('masks stored secrets and leaves other settings and empty secrets alone', () => {
  expect(maskSecrets({ botToken: '123:ABC', chatId: '42' }, secretFields)).toEqual({
    botToken: SECRET_MASK,
    chatId: '42',
  });
  expect(maskSecrets({ botToken: '', chatId: '42' }, secretFields)).toEqual({
    botToken: '',
    chatId: '42',
  });
});

test('an unchanged mask keeps the stored secret', () => {
  const restored = restoreSecrets({ botToken: SECRET_MASK, chatId: '43' }, secretFields, {
    botToken: '123:ABC',
    chatId: '42',
  });
  expect(restored).toEqual({ metadata: { botToken: '123:ABC', chatId: '43' } });
});

test('a new value replaces the stored secret', () => {
  const restored = restoreSecrets({ botToken: '999:NEW' }, secretFields, { botToken: '123:ABC' });
  expect(restored).toEqual({ metadata: { botToken: '999:NEW' } });
});

test('a mask with nothing stored behind it is reported, never saved', () => {
  expect(restoreSecrets({ botToken: SECRET_MASK }, secretFields, undefined)).toEqual({
    missing: 'botToken',
  });
  expect(restoreSecrets({ botToken: SECRET_MASK }, secretFields, { chatId: '42' })).toEqual({
    missing: 'botToken',
  });
});

test('a mask in a field that is not secret is kept as typed', () => {
  expect(restoreSecrets({ chatId: SECRET_MASK }, secretFields, undefined)).toEqual({
    metadata: { chatId: SECRET_MASK },
  });
});
