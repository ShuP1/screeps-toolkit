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
): T | null {
  return Game.getObjectById(o.id)
}
/**
 * Generate a function to convert a {@link CacheableObject} to {@link CachedObject}.
 * @param fields keys to cache in your object
 * @returns a mapper function
 */
export function makeCachedObject<T extends CacheableObject, U extends CachedObject<T>>(
  fields: (keyof T)[]
) {
  return (o: T) =>
    fields.reduce(
      (acc, field) => {
        if (field != "room") acc[field] = o[field] as unknown as U[keyof T]
        return acc
      },
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
      { id: o.id, pos: o.pos } as U
    )
}

interface CacheOpts {
  /** Try to update the data if age is greater than this */
  refresh?: number
  /** Data is invalid if age is greater than this */
  ttl?: number
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
  V extends FindTypes[K],
  C extends CachedObject<V>
>(
  type: K,
  defaultOpts: CacheOpts & Partial<FilterOptions<K, V>> & { map?: (v: V) => C }
): (name: RoomName, opts?: CacheOpts) => readonly C[] {
  const cache = new Map<RoomName, [at: number, value: readonly C[]]>()
  return (name, opts) => {
    const cached = cache.get(name)
    // Return cached if fresh
    const refresh = opts?.refresh ?? defaultOpts.refresh ?? 0
    if (cached && Game.time + refresh <= cached[0]) return cached[1]
    // Try to refresh
    if (name in Game.rooms) {
      const value = Game.rooms[name]
        .find(type, defaultOpts.filter ? { filter: defaultOpts.filter } : undefined)
        .map(defaultOpts.map ?? makeCachedObject([]))
      cache.set(name, [Game.time, value])
      return value
    }
    // Return cached if still valid
    const ttl = opts?.ttl ?? defaultOpts.ttl
    return cached && (ttl == undefined || Game.time + ttl <= cached[0]) ? cached[1] : []
  }
}
