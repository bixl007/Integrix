/** A copy of `list` with the item at `from` moved to `to`; unchanged when either index is out of range. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  if (from === to || from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}
