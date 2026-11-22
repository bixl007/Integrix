export interface OAuthProfile {
  email: string;
  name: string;
}

/** One OAuth 2.0 sign-in provider. Add a provider by implementing this and registering it. */
export interface OAuthProvider {
  id: string;
  label: string;
  authorizeUrl(state: string, redirectUri: string): string;
  /** Exchanges the callback code for a profile with a provider-verified email. */
  exchange(code: string, redirectUri: string): Promise<OAuthProfile>;
}
