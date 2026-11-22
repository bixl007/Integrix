import type { Request, Response } from 'express';
import { SESSION_COOKIE, SESSION_TTL_MS } from '../config';
import { prismaClient } from '../db';
import { cookieOptions, readCookie } from '../lib/cookies';
import { randomToken, sha256 } from '../lib/crypto';

/** Creates a 7-day session and sets it as an httpOnly cookie. */
export async function startSession(res: Response, userId: number) {
  const token = randomToken();
  const now = new Date();
  await prismaClient.$transaction([
    // Opportunistic cleanup keeps the table small without a cron job.
    prismaClient.session.deleteMany({ where: { userId, expiresAt: { lt: now } } }),
    prismaClient.session.create({
      data: {
        userId,
        tokenHash: sha256(token),
        expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      },
    }),
  ]);
  res.cookie(SESSION_COOKIE, token, cookieOptions(SESSION_TTL_MS));
}

/** Returns the user id for a valid session cookie, or null. */
export async function resolveSession(req: Request): Promise<number | null> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const session = await prismaClient.session.findUnique({ where: { tokenHash: sha256(token) } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prismaClient.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.userId;
}

export async function endSession(req: Request, res: Response) {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await prismaClient.session.deleteMany({ where: { tokenHash: sha256(token) } });
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(0), maxAge: undefined });
}

/** Signs out every other device for this user, keeping the current session. */
export async function revokeOtherSessions(req: Request, userId: number) {
  const token = readCookie(req, SESSION_COOKIE);
  await prismaClient.session.deleteMany({
    where: { userId, ...(token && { tokenHash: { not: sha256(token) } }) },
  });
}
