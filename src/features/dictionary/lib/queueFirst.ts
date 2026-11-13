// Puts queued items first, then the other items, skipping duplicates, cut to `limit`.
// `getKey` says which items are "the same". The default works for strings and numbers
// (for objects, pass a function such as (item) => item.id).
export function queueFirst<T>(
  queueItems: T[],
  otherItems: T[],
  limit: number,
  getKey: (item: T) => string | number = (item) => String(item),
): T[] {
  const seenKeys = new Set<string | number>();
  const result: T[] = [];
  for (const item of [...queueItems, ...otherItems]) {
    if (result.length >= limit) break;
    const key = getKey(item);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    result.push(item);
  }
  return result;
}
