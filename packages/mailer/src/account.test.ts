import { expect, test } from 'bun:test';
import { gmailTransport } from './index';

test('a Gmail account uses Gmail over TLS with bounded waits', () => {
  const options = gmailTransport({ user: ' me@gmail.com ', appPassword: 'abcd efgh ijkl mnop' });
  expect(options).toMatchObject({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: 'me@gmail.com', pass: 'abcdefghijklmnop' },
    connectionTimeout: 10_000,
    socketTimeout: 10_000,
  });
});
