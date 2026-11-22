import { googleProvider } from './google';
import type { OAuthProvider } from './types';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

// Only providers with credentials configured are exposed to the web app.
// To add one, implement OAuthProvider in ./<name>.ts and list it here.
export const oauthProviders: Record<string, OAuthProvider> = Object.fromEntries(
  [
    GOOGLE_CLIENT_ID &&
      GOOGLE_CLIENT_SECRET &&
      googleProvider(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
  ]
    .filter((p): p is OAuthProvider => !!p)
    .map((p) => [p.id, p]),
);
