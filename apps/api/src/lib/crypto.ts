import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export const randomToken = () => randomBytes(32).toString('base64url');

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** Six-digit numeric code, zero-padded. */
export const generateOtp = () => randomInt(0, 1_000_000).toString().padStart(6, '0');

/** Constant-time comparison of two hex digests. */
export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
