import type { CookieOptions, Request } from 'express';
import { COOKIE_SECURE } from '../config';

/** Reads one cookie from the raw header (avoids a cookie-parser dependency). */
export function readCookie(req: Request, name: string): string | undefined {
  for (const part of req.headers.cookie?.split(';') ?? []) {
    const eq = part.indexOf('=');
    if (eq > -1 && part.slice(0, eq).trim() === name)
      return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

export const cookieOptions = (maxAge: number, path = '/'): CookieOptions => ({
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'lax',
  path,
  maxAge,
});
