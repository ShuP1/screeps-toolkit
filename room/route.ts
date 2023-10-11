import { RoomName } from "../position/types"
import { ROOM_MAX } from "../position/constants"
import { cache } from "../utils"

export type FindRouteFn = (
  fromRoom: string,
  toRoom: string
) => ReturnType<typeof Game.map.findRoute>
const defaultFindRouteCached: FindRouteFn = cache(
  (f: string, t: string) => Game.map.findRoute(f, t),
  (f, t) => f + t
)

/**
 * Provide a function like {@link Game.map.findRoute} but with cache.
 * It requires than routeCallback is deterministic
 * @param routeCallback optional function computing the cost to enter a room
 * @returns a function like findRoute
 */
export function findRouteCached(
  routeCallback?: (to: RoomName, from: RoomName) => number
): FindRouteFn {
  if (!routeCallback) return defaultFindRouteCached
  return cache(
    (f, t) =>
      Game.map.findRoute(f, t, {
        routeCallback: routeCallback as (t: string, f: string) => number,
      }),
    (f, t) => f + t
  )
}

/**
 * Compute a distance lower bound from {@link Game.map.findRoute} path.
 * @param from start position
 * @param to destination position
 * @param findRoute optional replace the default route finder
 * @returns a distance between two points considering exit sides
 */
export function findRouteDist(
  from: RoomPosition,
  to: RoomPosition,
  findRoute: FindRouteFn = defaultFindRouteCached
) {
  const route = findRoute(from.roomName, to.roomName)
  if (route === ERR_NO_PATH) return Infinity
  const EXIT_MIN = 2
  const EXIT_MAX = ROOM_MAX - EXIT_MIN
  let dist = 0
  let xMin = from.x
  let xMax = from.x
  let yMin = from.y
  let yMax = from.y
  for (const { exit } of route) {
    switch (exit) {
      case FIND_EXIT_TOP:
        dist += yMin
        xMin = Math.max(EXIT_MIN, xMin - yMin)
        xMax = Math.min(EXIT_MAX, xMax + yMin)
        yMin = yMax = ROOM_MAX
        break
      case FIND_EXIT_RIGHT: {
        const dX = ROOM_MAX - xMax
        dist += dX
        yMin = Math.max(EXIT_MIN, yMin - dX)
        yMax = Math.min(EXIT_MAX, yMax + dX)
        xMin = xMax = 0
        break
      }
      case FIND_EXIT_BOTTOM: {
        const dY = ROOM_MAX - yMax
        dist += dY
        xMin = Math.max(EXIT_MIN, xMin - dY)
        xMax = Math.min(EXIT_MAX, xMax + dY)
        yMin = yMax = 0
        break
      }
      case FIND_EXIT_LEFT:
        dist += xMin
        yMin = Math.max(EXIT_MIN, yMin - xMin)
        yMax = Math.min(EXIT_MAX, yMax + xMin)
        xMin = xMax = ROOM_MAX
        break
    }
  }
  dist += Math.max(to.x - xMax, xMin - to.x, to.y - yMax, yMin - to.y, 0)
  return dist
}
