/**
 * Like `return map[key] ??= fallback(key)` but for {@link Map}.
 * @param map the target map
 * @param key element key
 * @param fallback default element value
 * @returns existing value or fallback
 */
export function getOrSetMap<K, V>(map: Map<K, V>, key: K, fallback: (key: K) => V) {
  if (!map.has(key)) map.set(key, fallback(key))
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return map.get(key)!
}
