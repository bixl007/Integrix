import { afterAll, beforeAll, expect, test } from 'bun:test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { guardedLookup, isInternalAddress, postJson, request } from './http';

test('internal and non-IP addresses are blocked, public ones are not', () => {
  const blocked = [
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    'not-an-ip',
  ];
  for (const address of blocked)
    expect([address, isInternalAddress(address)]).toEqual([address, true]);
  for (const address of [
    '8.8.8.8',
    '1.1.1.1',
    '172.32.0.1',
    '2606:4700:4700::1111',
    '::ffff:8.8.8.8',
    '::ffff:808:808',
  ]) {
    expect([address, isInternalAddress(address)]).toEqual([address, false]);
  }
});

test('a hostname that resolves to an internal address fails the lookup', async () => {
  const error = await new Promise<Error | null>((resolve) =>
    guardedLookup(isInternalAddress)('localhost', {}, (e) => resolve(e)),
  );
  expect(error?.message).toBe('localhost resolves to a private or internal address');
});

test('rejects internal literals, other schemes and bad URLs before connecting', async () => {
  await expect(request('http://127.0.0.1:1/')).rejects.toThrow('private or internal');
  await expect(request('http://2130706433/')).rejects.toThrow('private or internal');
  await expect(request('http://[::1]/')).rejects.toThrow('private or internal');
  await expect(request('http://169.254.169.254/latest/meta-data')).rejects.toThrow(
    'private or internal',
  );
  await expect(request('file:///etc/passwd')).rejects.toThrow('Only http and https');
  await expect(request('not a url')).rejects.toThrow('not valid');
});

// The guard is switched off for these: the test server has to live on loopback.
const allowAll = () => false;
let server: Server;
let base = '';

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (req.url?.startsWith('/fail')) {
        res.writeHead(500).end('token=shh went wrong');
      } else if (req.url === '/redirect') {
        res.writeHead(302, { Location: 'http://127.0.0.1:1/' }).end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ method: req.method, type: req.headers['content-type'], body }));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

test('sends the method, headers and body and returns the response', async () => {
  const response = await request(
    `${base}/ok`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"a":1}' },
    allowAll,
  );
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toEqual({
    method: 'POST',
    type: 'application/json',
    body: '{"a":1}',
  });
});

test('throws on a response outside 2xx, naming the host but not the path or query', async () => {
  const failure = request(`${base}/fail?secret=abc`, {}, allowAll);
  await expect(failure).rejects.toThrow('127.0.0.1 answered 500');
  await expect(failure).rejects.not.toThrow('secret=abc');
});

test('does not follow redirects', async () => {
  await expect(request(`${base}/redirect`, {}, allowAll)).rejects.toThrow('answered 302');
});

test('postJson is blocked by the default guard', async () => {
  await expect(postJson(`${base}/ok`, { a: 1 })).rejects.toThrow('private or internal');
});
