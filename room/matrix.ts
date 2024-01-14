import { RoomName } from "../position/types"
import { Dict } from "../utils/map"
import { OBSTACLE_TYPES, OBSTACLE_TYPES_NO_DESTRUCTIBLE } from "./object"
import { getRoom } from "./utils"

/** Options for {@link getRoomMatrix} */
export interface RoomMatrixOpts {
  ignoreCreeps?: boolean
  ignoreRoads?: boolean
  ignoreStructures?: boolean
  ignoreDestructibleStructures?: boolean
  avoidRoads?: boolean
}

/**
 * Create objects matrix for a visible room or use cache.
 * @param name target room name
 * @param opts matrix content options
 * @param cache an optional cache map
 * @returns a CostMatrix of objects in the room
 */
export function getRoomMatrix(name: RoomName, opts: RoomMatrixOpts, cache = {}) {
  const cache_ = cache as Dict<string, [at: number, cm: CostMatrix | undefined]>
  let key: string = name
  if (!opts.ignoreStructures) key += opts.ignoreDestructibleStructures ? "s" : "S"
  if (opts.avoidRoads) key += "r"
  else if (!opts.ignoreRoads) key += "R"
  if (!opts.ignoreCreeps) key += "c"
  const cached = cache_[key]
  if (cached && cached[0] == Game.time) return cached[1]

  let matrix: CostMatrix | undefined = undefined
  const room = getRoom(name)
  if (room) {
    if (!opts.ignoreRoads || opts.avoidRoads) {
      const roads = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } })
      if (roads.length) {
        const roadCost = opts.avoidRoads ? 10 : 1
        matrix ??= new PathFinder.CostMatrix()
        for (const {
          pos: { x, y },
        } of roads) {
          matrix.set(x, y, roadCost)
        }
      }
    }
    if (!opts.ignoreStructures) {
      const types = opts.ignoreDestructibleStructures
        ? OBSTACLE_TYPES_NO_DESTRUCTIBLE
        : OBSTACLE_TYPES
      matrix ??= new PathFinder.CostMatrix()
      const structures: (AnyStructure & Partial<OwnedStructure>)[] = room.find(FIND_STRUCTURES)
      for (const {
        structureType,
        pos: { x, y },
        my,
      } of structures) {
        if (
          types.has(structureType) ||
          (!opts.ignoreDestructibleStructures && !my && structureType == STRUCTURE_RAMPART)
        )
          matrix.set(x, y, 0xff)
      }
    }
    if (!opts.ignoreCreeps) {
      const creeps = room.find(FIND_CREEPS)
      if (creeps.length) {
        matrix ??= new PathFinder.CostMatrix()
        for (const {
          pos: { x, y },
        } of creeps)
          matrix.set(x, y, 0xff)
      }
      const pCreeps = room.find(FIND_POWER_CREEPS)
      if (pCreeps.length) {
        matrix ??= new PathFinder.CostMatrix()
        for (const {
          pos: { x, y },
        } of pCreeps)
          matrix.set(x, y, 0xff)
      }
    }
  } else {
    if (key.endsWith("c")) key.slice(0, -1)
    const old = cache_[key]
    if (old) return old[1]
  }

  cache_[key] = [Game.time, matrix]
  return matrix
}
