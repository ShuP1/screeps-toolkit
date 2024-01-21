import { RoomName } from "../position/types"
import { inRoomRangeXY } from "../position/utils"
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
  avoidMyConstructionSites?: boolean
  avoidMySpawns?: boolean
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
  if (opts.avoidMyConstructionSites) key += "x"
  if (opts.avoidMySpawns) key += "q"
  const cached = cache_[key]
  if (cached && cached[0] == Game.time) return cached[1]

  let matrix: CostMatrix | undefined = undefined
  const block = (ps: _HasRoomPosition[], v = 0xff) => {
    if (!ps.length) return
    matrix ??= new PathFinder.CostMatrix()
    for (const {
      pos: { x, y },
    } of ps)
      matrix.set(x, y, v)
  }
  const room = getRoom(name)
  if (room) {
    if (!opts.ignoreRoads || opts.avoidRoads) {
      block(
        room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } }),
        opts.avoidRoads ? 10 : 1
      )
    }
    if (!opts.ignoreStructures) {
      const types = opts.ignoreDestructibleStructures
        ? OBSTACLE_TYPES_NO_DESTRUCTIBLE
        : OBSTACLE_TYPES
      block(
        room.find(FIND_STRUCTURES, {
          filter: (s) =>
            types.has(s.structureType) ||
            (!opts.ignoreDestructibleStructures &&
              !(s as Partial<OwnedStructure>).my &&
              s.structureType == STRUCTURE_RAMPART),
        })
      )
    }
    if (!opts.ignoreCreeps) {
      block(room.find(FIND_CREEPS))
      block(room.find(FIND_POWER_CREEPS))
    }
    if (opts.avoidMyConstructionSites) {
      block(room.find(FIND_MY_CONSTRUCTION_SITES), 50)
    }
    if (opts.avoidMySpawns) {
      const sps = room.find(FIND_MY_SPAWNS)
      if (sps.length) {
        matrix ??= new PathFinder.CostMatrix()
        for (const s of sps) for (const p of inRoomRangeXY(s.pos)) matrix.set(p.x, p.y, 50)
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
