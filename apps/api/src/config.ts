export const PORT = Number(process.env.API_PORT ?? 3000);

// Public origins: the API's own (for OAuth redirect URIs) and the web app's (CORS + redirects).
export const API_PUBLIC_URL = process.env.API_PUBLIC_URL ?? `http://localhost:${PORT}`;
export const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3001';

export const SESSION_COOKIE = 'integrix_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

// Secure cookies need HTTPS; plain-http localhost keeps working in dev.
export const COOKIE_SECURE = API_PUBLIC_URL.startsWith('https://');
