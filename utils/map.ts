/**
 * Like `return map[key] ??= fallback(key)` but for {@link Map}.
 * @param map the target map
 * @param key element key
 * @param fallback default element value
 * @returns existing value or fallback
 */
export function getOrSetMap<K, V>(map: Map<K, V>, key: K, fallback: (key: K) => V) {
  if (!map.has(key)) map.set(key, fallback(key))
  return map.get(key) as V
}

/**
 * Like `key => map[key] || fallback()` but for {@link Map}.
 * @param map the target map
 * @param fallback value if missing in the map
 * @returns a getter into the map
 */
export function getMapWithDefault<K, V>(map: Map<K, V>, fallback: () => V) {
  return (key: K) => (map.has(key) ? (map.get(key) as V) : fallback())
}

export type Dict<K extends string, V> = Partial<Record<K, V>>
/**
 * Create a new {@link Dict}
 * @returns an empty dict
 */
export function newDict<K extends string, V>() {
  return {} as Dict<K, V>
}
