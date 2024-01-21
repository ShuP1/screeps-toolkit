import { ROOM_MAX } from "../position/constants"
import { RoomName } from "../position/types"
import {
  SomeRoomPosition,
  getDirectionTo,
  getDirectionsSorted,
  getToDirection,
  isExit,
  normalizePos,
} from "../position/utils"
import { isObjectObstacle } from "../room/object"
import { lookForInRange } from "../room/find"
import { RoomMatrixOpts, getRoomMatrix } from "../room/matrix"
import { isTerrainWalkableAt } from "../room/terrain"
import { some } from "../utils/iterable"
import { getMoveEfficiency } from "./body"
import { TERRAIN_MOVE_FATIGUE } from "./constants"

export type IN_RANGE = 1
export const IN_RANGE = 1

type GoToMemory = [
  destRoom: string,
  destX: number,
  destY: number,
  range: number,
  priority: number,
  prevX: number,
  prevY: number,
  lastMove: number,
  path: string
]
function setMem(mem: GoToMemory | [], vals: GoToMemory) {
  vals.forEach((v, i) => (mem[i] = v))
  return mem as GoToMemory
}

export interface FindGoToPathOpts extends FindPathOpts, RoomMatrixOpts {
  range?: number
  /** user provider path */
  path?: RoomPosition[]
  excludeRoom?: (n: RoomName) => boolean
}
export interface GoToOpts extends FindGoToPathOpts, MoveToOpts {
  usedCapacity?: number
  priority?: number
  noPush?: boolean
  ret?: GoToReturn
}
export interface GoToReturn {
  path?: PathFinderPath
  searches?: number
  ops?: number
}

function getPathNext(from: RoomPosition, path: RoomPosition[]) {
  if (!path.length) return undefined
  for (let i = 0; i < path.length; i++) if (from.isEqualTo(path[i])) return i + 1
  for (let i = path.length; i >= 0; i--) if (from.isNearTo(path[i])) return i
  return undefined
}
function serializePath(from: RoomPosition, path: RoomPosition[]) {
  let ret = "" //MAYBE: multi room path
  let cur = { x: from.x, y: from.y }
  for (const next of path) {
    if (next.roomName != from.roomName) break
    ret = getDirectionTo(cur, next).toString() + ret
    cur = next
  }
  return ret
}
function deserializePath(from: RoomPosition, path: string) {
  const ret: RoomPosition[] = []
  let cur = from
  for (let i = path.length - 1; i >= 0; i--) {
    const dir = Number(path[i]) as DirectionConstant
    const next = getToDirection(cur, dir)
    if (!next) break
    ret.push(next)
    cur = next
  }
  return ret
}

function go(
  c: Creep,
  dir: DirectionConstant,
  getMemory: (o: Creep) => GoToMemory | [],
  move: (o: Creep, to: RoomPosition, noPush?: boolean) => boolean,
  noPush?: boolean
) {
  const dest = getToDirection(c.pos, dir)
  if (!dest) return c.move(dir)

  if (!isTerrainWalkableAt(dest)) return ERR_INVALID_TARGET
  if (dest.lookFor(LOOK_STRUCTURES).some((l) => isObjectObstacle(l, true)))
    return ERR_INVALID_TARGET

  // Other creeps moving to the same position
  for (const o of lookForInRange(dest, LOOK_CREEPS, 1)) {
    if (o === c || !o.my || o.pos.isEqualTo(dest)) continue
    const oMem = getMemory(o)
    if (!oMem.length || !oMem[8].length || oMem[7] != Game.time) continue
    const oDir = Number(oMem[8][oMem[8].length - 1]) as DirectionConstant
    if (!getToDirection(o.pos, oDir)?.isEqualTo(dest)) continue
    //TODO: if c.priority > o.priority moveTo(o)
    return ERR_FULL
  }

  const blocker = dest.lookFor(LOOK_CREEPS)[0] as Creep | undefined
  if (blocker && (blocker.my || !c.room.controller?.my || !c.room.controller.safeMode)) {
    if (!blocker.my || blocker.fatigue || blocker.spawning) return ERR_FULL

    const bMem = [...getMemory(blocker)] as GoToMemory | []
    if (!bMem.length) return ERR_FULL

    const [bRoomName, bX, bY, bRange, , , , bTime] = bMem
    if (bTime !== Game.time) {
      const bTo = new RoomPosition(bX, bY, bRoomName)

      if (
        !(bTo.inRangeTo(c.pos, bRange) && move(blocker, c.pos, true)) && // swap
        (noPush ||
          (!move(blocker, bTo) && // closer
            !some(getDirectionsSorted(dir), (bDir) => {
              const bToOther = getToDirection(blocker.pos, bDir)
              return !!bToOther && bTo.inRangeTo(bToOther, bRange) && move(blocker, bToOther)
            }))) // still in range
      )
        return ERR_FULL
    }
  }
  return c.move(dir)
}

/**
 * Compute path with {@link goTo} options.
 * @param from initial position
 * @param to target position
 * @param opts parameters
 * @param roomMatrixCache cache for room matrices
 * @returns a path to the target
 */
export function findGoToPath(
  from: RoomPosition,
  to: RoomPosition,
  opts: FindGoToPathOpts & { efficiency: number },
  roomMatrixCache = {}
) {
  const { range = 1, efficiency } = opts

  if (!range && from.isNearTo(to)) return { path: [to] }

  //TODO: else if from.inRangeTo(to, range + 1)

  if (opts.path?.[opts.path.length - 1]?.inRangeTo(to, range)) {
    const idx = getPathNext(from, opts.path)
    if (idx !== undefined && idx < opts.path.length)
      return { path: idx ? opts.path.slice(idx) : opts.path }
  }

  opts.ignoreRoads ??= efficiency >= TERRAIN_MOVE_FATIGUE.swamp

  const fromRoom = from.roomName
  const toRoom = to.roomName
  const { excludeRoom, costCallback, ignoreRoads } = opts
  const cmOpts = { ignoreCreeps: true, ...opts }
  const ret = PathFinder.search(
    from,
    { range, pos: to },
    {
      roomCallback: (n) => {
        const name = n as RoomName
        if (excludeRoom && name != fromRoom && name != toRoom && excludeRoom(name)) return false

        let matrix = getRoomMatrix(name, cmOpts, roomMatrixCache)
        if (costCallback) {
          matrix = matrix?.clone() ?? new PathFinder.CostMatrix()
          const outcome = costCallback(n, matrix)
          if (outcome !== undefined) return outcome
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return matrix! //NOTE: undefined == empty matrix
      },
      maxOps:
        opts.maxOps ?? ((opts.maxRooms ?? Infinity) > 1 && fromRoom != toRoom ? 20000 : undefined),
      maxRooms: opts.maxRooms,
      plainCost:
        opts.plainCost ?? (efficiency >= TERRAIN_MOVE_FATIGUE.plain || ignoreRoads ? 1 : 2),
      swampCost:
        opts.swampCost ??
        Math.max(1, Math.ceil((TERRAIN_MOVE_FATIGUE.swamp / efficiency) * (ignoreRoads ? 1 : 2))),
      heuristicWeight: opts.heuristicWeight ?? 1.1,
    }
  )
  if (!ret.path.length || ret.path[0].roomName != fromRoom) ret.path = []
  return ret
}
/**
 * Read {@link goTo} cached path from creep memory
 * @param c target creep
 * @param to destination to check
 * @param getMemory same as {@link goTo}
 * @param limit max positions to deserialize
 * @returns a cached path
 */
export function getGoToPath(
  c: Creep,
  to: RoomPosition,
  getMemory: (c: Creep) => GoToMemory | [],
  limit?: number
) {
  if (!c.my) return []

  const mem = getMemory(c)
  if (!mem.length) return []

  const [mToRoom, mToX, mToY, , , , , mTime, mPath] = mem
  if (to.x != mToX || to.y != mToY || to.roomName != mToRoom) return []

  const cut = Game.time == mTime
  return deserializePath(c.pos, mPath.slice(limit ? mPath.length - Number(cut) - limit : 0, cut ? -1 : undefined))
}

/**
 * {@link Creep.moveTo} with smart push
 * @param c target creep
 * @param target destination
 * @param getMemory get a persistant array of data for a given creep. `c => c.memory._m ?? []`
 * @param roomMatrixCache cache for room matrices
 * @param opts movement parameters
 * @returns status code
 */
export function goTo(
  c: Creep,
  target: SomeRoomPosition,
  getMemory: (c: Creep) => GoToMemory | [],
  roomMatrixCache = {},
  opts: GoToOpts = {}
): ScreepsReturnCode | IN_RANGE {
  if (!c.my) return ERR_NOT_OWNER
  if (c.spawning) return ERR_BUSY

  const to = normalizePos(target) as RoomPosition | undefined
  if (!to) return ERR_INVALID_TARGET

  const range = (opts.range = isExit(to)
    ? 0
    : Math.min(opts.range ?? 1, to.x, to.y, ROOM_MAX - to.x, ROOM_MAX - to.y))
  opts.priority ??= 0
  opts.reusePath ??= Infinity

  const from = c.pos
  const defaultM: GoToMemory = [
    to.roomName,
    to.x,
    to.y,
    range,
    opts.priority,
    from.x,
    from.y,
    0,
    "",
  ]
  const partialMem = getMemory(c)
  const mem = partialMem.length ? partialMem : setMem(partialMem, defaultM)
  const [mToRoom, mToX, mToY, , , mPrevX, mPrevY, mTime] = mem

  if (to.x == mToX && to.y == mToY && to.roomName == mToRoom) {
    if (mTime == Game.time) return from.inRangeTo(to, range) ? IN_RANGE : OK
  } else {
    setMem(mem, defaultM)
  }

  if (from.inRangeTo(to, range)) return IN_RANGE
  if (c.fatigue) return ERR_TIRED

  if (
    mem[8].length > 1 &&
    opts.reusePath &&
    (from.x != mPrevX || from.y != mPrevY) &&
    !isExit(from)
  ) {
    mem[8] = mem[8].slice(0, -1)
  } else {
    mem[8] = ""
  }

  const efficiency = getMoveEfficiency(c, opts.usedCapacity)
  if (!efficiency) return ERR_NO_BODYPART

  if (!mem[8].length) {
    // Repath
    if (opts.noPathFinding) return ERR_NOT_FOUND

    const ret = findGoToPath(from, to, Object.assign(opts, { efficiency }), roomMatrixCache)
    if (opts.ret && "cost" in ret) {
      opts.ret.searches ??= 0
      opts.ret.searches += 1
      opts.ret.ops ??= 0
      opts.ret.ops += ret.ops
      opts.ret.path = ret
    }
    mem[8] = serializePath(from, ret.path)
    if (!mem[8].length) return ERR_NO_PATH
  }

  function doPush(o: Creep, to: RoomPosition, noPush?: boolean) {
    const oMemPrev = [...getMemory(o)] as GoToMemory
    const ok =
      goTo(o, to, getMemory, roomMatrixCache, {
        range: 0,
        ignoreCreeps: true,
        noPush,
        ret: opts.ret,
      }) == OK
    // Restore previous memory
    const oMem = getMemory(o)
    if (ok && oMem.length) {
      const [oRoomName, oX, oY, oRange] = oMemPrev
      oMem[3] = oRange
      if (oMem[1] !== oX || oMem[2] !== oY || oMem[0] !== oRoomName) {
        oMem[1] = oX
        oMem[2] = oY
        oMem[0] = oRoomName
        oMem[8] = ""
      }
    } else {
      setMem(oMem, oMemPrev)
    }
    return ok
  }

  const path = mem[8]
  const retPath = opts.ret?.path
  setMem(mem, defaultM)
  if (opts.reusePath) mem[8] = path
  mem[7] = Game.time //NOTE: assume will move to allow swap

  const dir = Number(path[path.length - 1]) as DirectionConstant
  const code = go(c, dir, getMemory, doPush, opts.noPush)

  if (opts.ret) opts.ret.path = retPath
  if (code == OK) return OK

  // Try to path around
  mem[7] = 0
  if (opts.ignoreCreeps === undefined) {
    //TODO: fix path around
    opts.ignoreCreeps = false
    delete opts.path
    getMemory(c).length = 0
    return goTo(c, target, getMemory, roomMatrixCache, opts)
  }

  return ERR_NOT_IN_RANGE
}
