import { fetchJson, form } from './http';
import type { OAuthProvider } from './types';

export function googleProvider(clientId: string, clientSecret: string): OAuthProvider {
  return {
    id: 'google',
    label: 'Google',
    authorizeUrl: (state, redirectUri) =>
      `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
      })}`,
    async exchange(code, redirectUri) {
      const { access_token } = await fetchJson<{ access_token: string }>(
        'https://oauth2.googleapis.com/token',
        form({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      );
      const info = await fetchJson<{ email?: string; email_verified?: boolean; name?: string }>(
        'https://openidconnect.googleapis.com/v1/userinfo',
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      if (!info.email || !info.email_verified)
        throw new Error('Google account has no verified email');
      return { email: info.email.toLowerCase(), name: info.name ?? info.email.split('@')[0]! };
    },
  };
}
