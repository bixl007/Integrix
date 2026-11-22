/** The largest centred square of a `width` x `height` image. */
export function squareCrop(width: number, height: number) {
  const side = Math.min(width, height);
  return { x: Math.round((width - side) / 2), y: Math.round((height - side) / 2), side };
}

/** Crops an image file to a centred square and returns it as a small JPEG data URL. Browser only. */
export async function squareImage(file: File, size = 128): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { x, y, side } = squareCrop(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot resize images');
  // JPEG has no transparency, so a transparent PNG gets a white background, not black.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.drawImage(bitmap, x, y, side, side, 0, 0, size, size);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}
