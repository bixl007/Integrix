import type { PrismaClient } from '@integrix/database';
import { connectionKey, unseal } from '@integrix/database';

/** Reads a sealed connection into its string values; throws when it is not a flat string map. */
export function readConnection(sealed: string, key: Buffer): Record<string, string> {
  const values: unknown = JSON.parse(unseal(sealed, key));
  if (values === null || typeof values !== 'object' || Array.isArray(values)) {
    throw new Error('The connection could not be read');
  }
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]));
}

/**
 * The credential a step runs with, or undefined when it names none and uses the server default.
 * Only the zap owner's own connections are found. Errors say what to fix and never include a value.
 */
export async function loadConnection(
  prisma: PrismaClient,
  connectionId: unknown,
  userId: number,
): Promise<Record<string, string> | undefined> {
  if (typeof connectionId !== 'string' || !connectionId) return undefined;
  const connection = await prisma.connection.findFirst({ where: { id: connectionId, userId } });
  if (!connection) throw new Error('The connection this step uses was deleted. Pick another one.');
  const key = connectionKey();
  if (!key) throw new Error('CONNECTION_SECRET is not set on the worker');
  try {
    return readConnection(connection.secret, key);
  } catch {
    throw new Error('The connection could not be read. Add it again in Settings.');
  }
}
