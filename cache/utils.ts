import { getOrSetMap } from "../utils/map"

/** An outdated or not found value from cache */
export type Invalid = Record<string, never> & Tag.OpaqueTag<"Invalid">
export const Invalid = {} as Invalid
/**
 * Check is {@link v} is not {@link Invalid}.
 * @param v thing to check
 * @returns whether v is found or not
 */
export function isValid<V>(v: V | Invalid): v is V {
  return v !== Invalid
}

/**
 * Wrap {@link fn} with a cache indexed by {@link K}.
 * @example sort(ts, cache(t => "heavy compute..."))
 * @param fn function to cache
 * @param getK optional function to extract {@link K} from {@link Ts}
 * @returns cached function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cache<Ts extends any[], V, K = Ts[0]>(
  fn: (...ts: Ts) => V,
  getK: ((...ts: Ts) => K) | (Ts extends [K] ? undefined : never)
) {
  const cache = new Map<K, V>()
  const k = getK ?? ((...ts) => ts[0] as K)
  return (...ts: Ts) => getOrSetMap(cache, k(...ts), () => fn(...ts))
}

/**
 * Wrap {@link fn} with a cache indexed by {@link K} it is refreshed every given {@link ticks}.
 * @param fn function to cache
 * @param ticks number of ticks to keep
 * @returns cached function
 */
export function cacheForTicks<K, V>(fn: (key: K) => V, ticks = 1) {
  const cache = new Map<K, [at: number, value: V]>()
  return (key: K) => {
    const cached = cache.get(key)
    if (cached && cached[0] + ticks >= Game.time) return cached[1]
    const value = fn(key)
    cache.set(key, [Game.time, value])
    return value
  }
}
