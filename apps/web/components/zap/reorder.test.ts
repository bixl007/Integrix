import { expect, test } from 'bun:test';
import { moveItem } from './reorder';

test('moves an item down and up, shifting the ones in between', () => {
  expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
});

test('leaves the list as it was for a no-op or an index out of range', () => {
  const list = ['a', 'b'];
  expect(moveItem(list, 1, 1)).toEqual(list);
  expect(moveItem(list, 0, 2)).toEqual(list);
  expect(moveItem(list, -1, 0)).toEqual(list);
  expect(moveItem(list, 0, 1)).not.toBe(list);
});
