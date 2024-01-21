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
/**
 * Iterate over {@link Dict} entries
 * @param d target dict
 * @returns array of key value pairs
 */
export function iterDict<K extends string, V>(d: Dict<K, V>) {
  return Object.entries(d) as unknown as readonly [K, V][]
}

/**
 * Like `d[k] = v` but delete the key if {@link v} is undefined.
 * @param d target dict
 * @param k key to set
 * @param v value to set
 * @returns the value
 */
export function setOrDelete<K extends string, V>(d: Dict<K, V>, k: K, v: V) {
  if (v !== undefined) d[k] = v
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  else delete d[k]
  return v
}
