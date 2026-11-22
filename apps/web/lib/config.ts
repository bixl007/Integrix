// Inlined at build time; defaults match the local dev ports.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export const HOOKS_URL = process.env.NEXT_PUBLIC_HOOKS_URL ?? 'http://localhost:3002';

export const webhookUrl = (userId: number | string, zapId: string) =>
  `${HOOKS_URL}/hooks/catch/${userId}/${zapId}`;
