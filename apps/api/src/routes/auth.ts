import { Router } from 'express';
import { oauthProviders } from '../auth';
import { API_PUBLIC_URL, WEB_URL } from '../config';
import { prismaClient } from '../db';
import { cookieOptions, readCookie } from '../lib/cookies';
import { randomToken } from '../lib/crypto';
import { resolveSession, startSession } from '../services/session';

export const authRouter = Router();

const STATE_COOKIE = 'integrix_oauth_state';
const STATE_PATH = '/api/v1/auth';
const STATE_TTL_MS = 10 * 60 * 1000;

const redirectUri = (provider: string) =>
  `${API_PUBLIC_URL}/api/v1/auth/oauth/${provider}/callback`;

// Current user or null; always 200 so anonymous page views don't log errors.
authRouter.get('/session', async (req, res) => {
  const userId = await resolveSession(req);
  const user =
    userId === null
      ? null
      : await prismaClient.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true, avatar: true },
        });
  res.json({ user });
});

// Lets the web app render buttons only for configured providers.
authRouter.get('/providers', (_req, res) => {
  res.json({ providers: Object.values(oauthProviders).map(({ id, label }) => ({ id, label })) });
});

authRouter.get('/oauth/:provider', (req, res) => {
  const provider = oauthProviders[req.params.provider];
  if (!provider) {
    res.status(404).json({ message: 'Unknown provider' });
    return;
  }
  // CSRF protection: the callback must echo this random state back.
  const state = randomToken();
  res.cookie(STATE_COOKIE, `${provider.id}:${state}`, cookieOptions(STATE_TTL_MS, STATE_PATH));
  res.redirect(provider.authorizeUrl(state, redirectUri(provider.id)));
});

authRouter.get('/oauth/:provider/callback', async (req, res) => {
  const provider = oauthProviders[req.params.provider];
  const { code, state } = req.query;
  const expected = readCookie(req, STATE_COOKIE);
  res.clearCookie(STATE_COOKIE, { ...cookieOptions(0, STATE_PATH), maxAge: undefined });

  if (
    !provider ||
    typeof code !== 'string' ||
    typeof state !== 'string' ||
    expected !== `${provider.id}:${state}`
  ) {
    res.redirect(`${WEB_URL}/login?error=oauth`);
    return;
  }

  try {
    const profile = await provider.exchange(code, redirectUri(provider.id));
    // Providers return verified emails only, so linking to an existing account by email is safe.
    const user = await prismaClient.user.upsert({
      where: { email: profile.email },
      update: { emailVerified: true },
      create: { email: profile.email, name: profile.name, emailVerified: true },
    });
    await startSession(res, user.id);
    res.redirect(`${WEB_URL}/dashboard`);
  } catch (e) {
    console.error(`OAuth ${provider.id} failed:`, e);
    res.redirect(`${WEB_URL}/login?error=oauth`);
  }
});
