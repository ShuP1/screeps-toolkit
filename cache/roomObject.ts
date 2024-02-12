import { RoomName } from "../position/types"

type CacheableObject = RoomObject & _HasId

/** A partially cached {@link RoomObject} with {@link Id} */
export type CachedObject<T extends CacheableObject> = Partial<T> & {
  id: Id<T>
  pos: RoomPosition
  room?: undefined
} & Tag.OpaqueTag<"CachedObject">
/**
 * Check if {@link o} is real or just cached.
 * @param o object to check
 * @returns whether the object is cached or not
 */
export function isCachedObject<T extends CacheableObject>(
  o: T | CachedObject<T>
): o is CachedObject<T> {
  return o.room === undefined
}
/**
 * Try to get real {@link RoomObject} from cached one.
 * @param o object to restore
 * @returns real {@link RoomObject} or null
 */
export function restoreCachedObject<T extends CacheableObject>(
  o: (CachedObject<T> & { id: Id<T> }) | T
) {
  return Game.getObjectById(o.id) as T | null
}

interface CacheOpts<C> {
  /** Try to update the data if age is greater than this */
  refresh?: number
  /** Data is invalid if age is greater than this */
  ttl?: number
  /** Fallback function when room not found */
  fallback?: (name: RoomName) => C[]
}
type FindCacheableConstant =
  | FIND_HOSTILE_CREEPS
  | FIND_SOURCES
  | FIND_DROPPED_RESOURCES
  | FIND_STRUCTURES
  | FIND_HOSTILE_STRUCTURES
  | FIND_HOSTILE_SPAWNS
  | FIND_CONSTRUCTION_SITES
  | FIND_MY_CONSTRUCTION_SITES
  | FIND_HOSTILE_CONSTRUCTION_SITES
  | FIND_MINERALS
  | FIND_NUKES
  | FIND_TOMBSTONES
  | FIND_HOSTILE_POWER_CREEPS
  | FIND_DEPOSITS
  | FIND_RUINS
/**
 * Like {@link Room.find} with {@link CachedObject}
 * @param type kind of find query
 * @param defaultOpts optional parameters
 * @returns an array of {@link CachedObject}
 */
export function findCached<
  K extends FindCacheableConstant,
  C extends CachedObject<V>,
  V extends FindTypes[K] = FindTypes[K]
>(
  type: K,
  defaultOpts: CacheOpts<C> &
    Partial<FilterOptions<K, V>> &
    PartialIfExtends<{ map: (v: V) => Untag<C> }, CachedObject<V>, C>
): (name: RoomName, opts?: CacheOpts<C>) => readonly C[] {
  const cache = new Map<RoomName, [at: number, value: readonly C[]]>()
  const map = (defaultOpts.map ?? (({ id, pos }) => ({ id, pos }))) as (v: V) => C
  return (name, opts) => {
    const cached = cache.get(name)
    // Return cached if fresh
    const refresh = opts?.refresh ?? defaultOpts.refresh ?? 0
    if (cached && Game.time <= cached[0] + refresh) return cached[1]
    // Try to refresh
    if (name in Game.rooms) {
      const value = Game.rooms[name]
        .find(type, defaultOpts.filter ? { filter: defaultOpts.filter } : undefined)
        .map(map)
      cache.set(name, [Game.time, value])
      return value
    }
    // Return cached if still valid
    const ttl = opts?.ttl ?? defaultOpts.ttl
    if (cached && (ttl == undefined || Game.time <= cached[0] + ttl)) return cached[1]
    // Return fallback empty array
    const fallback = opts?.fallback ?? defaultOpts.fallback
    if (!fallback) return []
    const fallbackValue = fallback(name)
    cache.set(name, [Number.NEGATIVE_INFINITY, fallbackValue])
    return fallbackValue
  }
}

type PartialIfExtends<T, A, B> = A extends B ? Partial<T> : T
type Untag<T> = Omit<T, "OpaqueTagSymbol">
