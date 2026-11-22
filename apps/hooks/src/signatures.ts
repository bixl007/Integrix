import { createHmac, timingSafeEqual } from 'node:crypto';

/** The parts of a request a signature check reads. Header names are lower case. */
export interface SignedRequest {
  rawBody: Buffer;
  header: (name: string) => string | undefined;
}

type Verifier = (request: SignedRequest, secret: string, nowSeconds: number) => boolean;

const hmac = (secret: string, data: Buffer | string, encoding: 'hex' | 'base64') =>
  createHmac('sha256', secret).update(data).digest(encoding);

/** Constant-time comparison; a missing value never matches. */
function safeEqual(given: string | undefined, expected: string) {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** A header that carries the HMAC of the raw body, optionally behind a prefix such as `sha256=`. */
const bodyHmac =
  (header: string, encoding: 'hex' | 'base64', prefix = ''): Verifier =>
  (request, secret) =>
    safeEqual(request.header(header), prefix + hmac(secret, request.rawBody, encoding));

/** A `t=<unix>,v1=<hex>` header that signs `<t>.<body>`; old timestamps are refused to stop replays. */
const timestamped =
  (header: string, toleranceSeconds: number): Verifier =>
  (request, secret, nowSeconds) => {
    const parts = (request.header(header) ?? '').split(',').map((part) => part.trim().split('='));
    const timestamp = parts.find(([key]) => key === 't')?.[1];
    if (!timestamp || Math.abs(nowSeconds - Number(timestamp)) > toleranceSeconds) return false;
    const expected = hmac(secret, `${timestamp}.${request.rawBody.toString('utf8')}`, 'hex');
    // A sender can list several v1 signatures while it rotates its secret.
    return parts.some(([key, value]) => key === 'v1' && safeEqual(value, expected));
  };

/** A header that must equal the secret itself. */
const sharedSecret =
  (header: string): Verifier =>
  (request, secret) =>
    safeEqual(request.header(header), secret);

const anyOf =
  (...checks: Verifier[]): Verifier =>
  (request, secret, nowSeconds) =>
    checks.some((check) => check(request, secret, nowSeconds));

// Keyed by the webhook trigger's `sender` setting; the web presets use the same ids.
export const verifiers: Record<string, Verifier> = {
  generic: anyOf(
    sharedSecret('x-integrix-secret'),
    bodyHmac('x-integrix-signature', 'hex', 'sha256='),
  ),
  github: bodyHmac('x-hub-signature-256', 'hex', 'sha256='),
  stripe: timestamped('stripe-signature', 300),
  shopify: bodyHmac('x-shopify-hmac-sha256', 'base64'),
  typeform: bodyHmac('typeform-signature', 'base64', 'sha256='),
  calendly: timestamped('calendly-webhook-signature', 180),
  calcom: bodyHmac('x-cal-signature-256', 'hex'),
  helius: sharedSecret('authorization'),
};

/** True when the request may start a run: the trigger has no secret, or the sender's check passes. */
export function verifyWebhook(
  settings: { sender?: unknown; secret?: unknown },
  request: SignedRequest,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (typeof settings.secret !== 'string' || !settings.secret) return true;
  // An unknown sender id falls back to the generic check instead of letting the request through.
  const verify = verifiers[String(settings.sender)] ?? verifiers.generic;
  return verify(request, settings.secret, nowSeconds);
}
