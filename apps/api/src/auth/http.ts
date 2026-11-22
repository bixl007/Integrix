/** Fetch JSON and throw on non-2xx, so provider failures surface as errors. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`OAuth request failed: ${res.status} ${url}`);
  return (await res.json()) as T;
}

export const form = (data: Record<string, string>) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(data).toString(),
});
