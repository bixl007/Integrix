import { expect, test } from 'bun:test';
import { readRunActions, snapshotActions } from './run-actions';

const email = { id: 'email', name: 'Email' };
const solana = { id: 'solana', name: 'Solana' };

test('snapshots actions in run order', () => {
  const snapshot = snapshotActions([
    { sortingOrder: 1, metadata: { address: '{to}' }, type: solana },
    { sortingOrder: 0, metadata: null, type: email },
  ]);
  expect(snapshot).toEqual([
    { actionId: 'email', name: 'Email', metadata: {} },
    { actionId: 'solana', name: 'Solana', metadata: { address: '{to}' } },
  ]);
});

test('a snapshot reads back unchanged', () => {
  const snapshot = snapshotActions([{ sortingOrder: 0, metadata: { email: '{e}' }, type: email }]);
  expect(readRunActions(JSON.parse(JSON.stringify(snapshot)))).toEqual(snapshot);
});

test('anything that is not a snapshot reads as undefined', () => {
  expect(readRunActions(null)).toBeUndefined();
  expect(readRunActions(undefined)).toBeUndefined();
  expect(readRunActions({})).toBeUndefined();
  expect(readRunActions([{ actionId: 'email' }])).toBeUndefined();
  expect(readRunActions([{ actionId: 'email', name: 'Email', metadata: [] }])).toBeUndefined();
});
