import { API_URL } from './config';

export const UNAUTHORIZED_EVENT = 'integrix:unauthorized';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  signal?: AbortSignal;
}

/** Single entry point for backend calls: JSON in/out, session cookie, typed errors. */
export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}) {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    signal,
    // The session lives in an httpOnly cookie on the API origin.
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(data?.message ?? 'Request failed', res.status);
  }
  return data as T;
}
