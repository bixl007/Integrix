import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/** The server's key for stored credentials, derived from CONNECTION_SECRET; undefined when it is unset. */
export function connectionKey(secret = process.env.CONNECTION_SECRET): Buffer | undefined {
  return secret ? createHash('sha256').update(secret).digest() : undefined;
}

/** Encrypts `plain` with AES-256-GCM. The result carries its own nonce and auth tag. */
export function seal(plain: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url')).join('.');
}

/** Reverses `seal`; throws when the key is wrong or the text was altered. */
export function unseal(sealed: string, key: Buffer): string {
  const [iv, tag, data] = sealed.split('.').map((part) => Buffer.from(part, 'base64url'));
  if (!iv || !tag || !data) throw new Error('Not a sealed value');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
