import { expect, test } from 'bun:test';
import { squareCrop } from './resize-image';

test('takes the centred square of a wide, a tall and a square image', () => {
  expect(squareCrop(400, 200)).toEqual({ x: 100, y: 0, side: 200 });
  expect(squareCrop(200, 500)).toEqual({ x: 0, y: 150, side: 200 });
  expect(squareCrop(128, 128)).toEqual({ x: 0, y: 0, side: 128 });
});
