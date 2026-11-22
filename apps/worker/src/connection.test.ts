import { expect, test } from 'bun:test';
import type { PrismaClient } from '@integrix/database';
import { connectionKey, seal } from '@integrix/database';
import { loadConnection, readConnection } from './connection';

const key = connectionKey('test-secret')!;
// A stand-in client that knows one connection, owned by user 7.
const prisma = (secret: string) =>
  ({
    connection: {
      findFirst: async ({ where }: { where: { id: string; userId: number } }) =>
        where.id === 'c1' && where.userId === 7 ? { secret } : null,
    },
  }) as unknown as PrismaClient;

test('reads the sealed values back as strings', () => {
  expect(readConnection(seal('{"user":"me@gmail.com","port":465}', key), key)).toEqual({
    user: 'me@gmail.com',
    port: '465',
  });
  expect(() => readConnection(seal('[1]', key), key)).toThrow('could not be read');
});

test('a step without a connection uses the server default', async () => {
  expect(await loadConnection(prisma(''), undefined, 7)).toBeUndefined();
  expect(await loadConnection(prisma(''), '', 7)).toBeUndefined();
});

test("a deleted connection, or another user's, fails the step with a fixable message", async () => {
  await expect(loadConnection(prisma(''), 'gone', 7)).rejects.toThrow('was deleted');
  await expect(loadConnection(prisma(''), 'c1', 8)).rejects.toThrow('was deleted');
});

test("loads the owner's connection, and reports an unreadable one without its contents", async () => {
  process.env.CONNECTION_SECRET = 'test-secret';
  const sealed = seal('{"privateKey":"SECRETKEY"}', key);
  expect(await loadConnection(prisma(sealed), 'c1', 7)).toEqual({ privateKey: 'SECRETKEY' });
  process.env.CONNECTION_SECRET = 'rotated';
  const failure = loadConnection(prisma(sealed), 'c1', 7);
  await expect(failure).rejects.toThrow('Add it again in Settings');
  await expect(failure).rejects.not.toThrow('SECRETKEY');
  delete process.env.CONNECTION_SECRET;
  await expect(loadConnection(prisma(sealed), 'c1', 7)).rejects.toThrow('CONNECTION_SECRET');
});
