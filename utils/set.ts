/** A set of keys. */
export type KeySet<T> = Map<T, unknown> | Set<T>
/** A readonly set of keys. */
export type ReadonlyKeySet<T> = ReadonlyMap<T, unknown> | ReadonlySet<T>

/**
 * Check if two key sets are equals.
 * @param a The first key set.
 * @param b The second key set.
 * @returns True if the key sets are equals, false otherwise.
 */
export function areKeySetsEqual<T>(a: ReadonlyKeySet<T>, b: ReadonlyKeySet<T>) {
  if (a.size !== b.size) return false
  for (const v of a.keys()) {
    if (!b.has(v)) return false
  }
  return true
}
