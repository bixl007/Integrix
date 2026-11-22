import { expect, test } from 'bun:test';
import { httpAction, parseHeaders } from './http';

test('parses header lines and ignores blank ones', () => {
  expect(parseHeaders('Authorization: Bearer a:b\n\n X-Id :  7 ')).toEqual({
    Authorization: 'Bearer a:b',
    'X-Id': '7',
  });
  expect(parseHeaders('')).toEqual({});
});

test('a header line without a name fails', () => {
  expect(() => parseHeaders('no colon here')).toThrow('Name: value');
  expect(() => parseHeaders(': value')).toThrow('Name: value');
});

test('the action refuses internal addresses and bad header lines', async () => {
  const step = { method: 'POST', url: 'http://{host}/hook', headers: '', body: '{"a":1}' };
  await expect(httpAction(step, { host: '127.0.0.1' })).rejects.toThrow('private or internal');
  await expect(httpAction(step, { host: '169.254.169.254' })).rejects.toThrow(
    'private or internal',
  );
  await expect(
    httpAction({ ...step, url: 'https://example.com', headers: 'broken' }, {}),
  ).rejects.toThrow('Name: value');
});
