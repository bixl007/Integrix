import { expect, test } from 'bun:test';
import { createHmac } from 'node:crypto';
import { verifiers, verifyWebhook } from './signatures';

const secret = 'whsec_test';
const body = '{"id":"evt_1","amount":4900}';
const now = 1_700_000_000;
const sign = (data: string, encoding: 'hex' | 'base64') =>
  createHmac('sha256', secret).update(data).digest(encoding);
const request = (headers: Record<string, string>, raw = body) => ({
  rawBody: Buffer.from(raw),
  header: (name: string) => headers[name],
});
const check = (sender: string, headers: Record<string, string>, raw = body, at = now) =>
  verifyWebhook({ sender, secret }, request(headers, raw), at);

test('a trigger without a secret accepts any request', () => {
  expect(verifyWebhook({}, request({}))).toBe(true);
  expect(verifyWebhook({ sender: 'github', secret: '' }, request({}))).toBe(true);
});

test('generic accepts the secret header or a signed body, and nothing else', () => {
  expect(check('generic', { 'x-integrix-secret': secret })).toBe(true);
  expect(check('generic', { 'x-integrix-signature': `sha256=${sign(body, 'hex')}` })).toBe(true);
  expect(check('generic', { 'x-integrix-secret': 'wrong' })).toBe(false);
  expect(check('generic', {})).toBe(false);
});

test('an unknown sender falls back to the generic check', () => {
  expect(check('nope', {})).toBe(false);
  expect(check('nope', { 'x-integrix-secret': secret })).toBe(true);
});

test('github signs the body as sha256=<hex>', () => {
  const headers = { 'x-hub-signature-256': `sha256=${sign(body, 'hex')}` };
  expect(check('github', headers)).toBe(true);
  expect(check('github', headers, `${body} `)).toBe(false);
  expect(check('github', { 'x-hub-signature-256': sign(body, 'hex') })).toBe(false);
});

test('shopify and typeform sign the body in base64', () => {
  expect(check('shopify', { 'x-shopify-hmac-sha256': sign(body, 'base64') })).toBe(true);
  expect(check('shopify', { 'x-shopify-hmac-sha256': sign('other', 'base64') })).toBe(false);
  expect(check('typeform', { 'typeform-signature': `sha256=${sign(body, 'base64')}` })).toBe(true);
  expect(check('typeform', { 'typeform-signature': sign(body, 'base64') })).toBe(false);
});

test('stripe and calendly sign "<timestamp>.<body>" and refuse old timestamps', () => {
  const header = (t: number) => `t=${t},v1=${sign(`${t}.${body}`, 'hex')}`;
  expect(check('stripe', { 'stripe-signature': header(now) })).toBe(true);
  expect(check('stripe', { 'stripe-signature': header(now - 299) })).toBe(true);
  expect(check('stripe', { 'stripe-signature': header(now - 301) })).toBe(false);
  expect(check('stripe', { 'stripe-signature': `t=${now},v1=deadbeef` })).toBe(false);
  expect(check('stripe', { 'stripe-signature': `v1=${sign(`${now}.${body}`, 'hex')}` })).toBe(
    false,
  );
  // A second v1 from a rotated secret doesn't hide the valid one.
  expect(
    check('stripe', { 'stripe-signature': `t=${now},v1=old,v1=${sign(`${now}.${body}`, 'hex')}` }),
  ).toBe(true);
  expect(check('calendly', { 'calendly-webhook-signature': header(now) })).toBe(true);
  expect(check('calendly', { 'calendly-webhook-signature': header(now - 181) })).toBe(false);
});

test('a signature from another timestamp does not verify', () => {
  const stale = `t=${now},v1=${sign(`${now - 60}.${body}`, 'hex')}`;
  expect(check('stripe', { 'stripe-signature': stale })).toBe(false);
});

test('helius sends the secret as the Authorization header', () => {
  expect(check('helius', { authorization: secret })).toBe(true);
  expect(check('helius', { authorization: `${secret}x` })).toBe(false);
});

test('every sender rejects a request with no headers', () => {
  for (const sender of Object.keys(verifiers))
    expect([sender, check(sender, {})]).toEqual([sender, false]);
});
