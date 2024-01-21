import { ROOM_MAX } from "../position/constants"
import { RoomName } from "../position/types"
import {
  SomeRoomPosition,
  getDirectionTo,
  getToDirection,
  isExit,
  normalizePos,
} from "../position/utils"
import { isTerrainWalkableAt, lookForInRange } from "../room/find"
import { RoomMatrixOpts, getRoomMatrix } from "../room/matrix"
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

export interface GoToOpts extends MoveToOpts, RoomMatrixOpts {
  priority?: number
  noPush?: boolean
  usedCapacity?: number
  excludeRoom?: (n: RoomName) => boolean
  heuristicWeight?: number
}

/**
 * {@link Creep.moveTo} with smart push
 * @param c target creep
 * @param target destination
 * @param getMemory get a persistant array of data for a given creep. `c => c.memory._m ?? []`
 * @param roomMatrixCache cache for room matrices
 * @param opts moving parameters
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
  opts.range = isExit(to)
    ? 0
    : Math.min(opts.range ?? 1, to.x, to.y, ROOM_MAX - to.x, ROOM_MAX - to.y)
  opts.priority ??= 0
  opts.reusePath ??= Infinity

  const defaultM: GoToMemory = [
    to.roomName,
    to.x,
    to.y,
    opts.range,
    opts.priority,
    c.pos.x,
    c.pos.y,
    0,
    "",
  ]
  const partialMem = getMemory(c)
  const mem = partialMem.length ? partialMem : setMem(partialMem, defaultM)
  const [mToRoom, mToX, mToY, , , mPrevX, mPrevY, mTime] = mem

  if (to.x == mToX && to.y == mToY && to.roomName == mToRoom) {
    if (mTime == Game.time) return c.pos.inRangeTo(to, opts.range) ? IN_RANGE : OK
  } else {
    setMem(mem, defaultM)
  }

  if (c.pos.inRangeTo(to, opts.range)) return IN_RANGE
  if (c.fatigue) return ERR_TIRED

  if (
    mem[8].length > 1 &&
    opts.reusePath &&
    (c.pos.x != mPrevX || c.pos.y != mPrevY) &&
    !isExit(c.pos)
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

    if (!opts.range && c.pos.isNearTo(to)) {
      mem[8] = c.pos.getDirectionTo(to).toString()
    } else {
      opts.ignoreRoads ??= efficiency >= TERRAIN_MOVE_FATIGUE.swamp

      const fromRoom = c.pos.roomName
      const toRoom = to.roomName
      const { excludeRoom, costCallback, ignoreRoads } = opts
      const cmOpts = { ignoreCreeps: true, ...opts }
      const ret = PathFinder.search(
        c.pos,
        { range: Math.max(1, opts.range || 0), pos: to },
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
            opts.maxOps ??
            ((opts.maxRooms ?? Infinity) > 1 && fromRoom != toRoom ? 20000 : undefined),
          maxRooms: opts.maxRooms,
          plainCost:
            opts.plainCost ?? (efficiency >= TERRAIN_MOVE_FATIGUE.plain || ignoreRoads ? 1 : 2),
          swampCost:
            opts.swampCost ??
            Math.max(
              1,
              Math.ceil((TERRAIN_MOVE_FATIGUE.swamp / efficiency) * (ignoreRoads ? 1 : 2))
            ),
          heuristicWeight: opts.heuristicWeight ?? 1.1,
        }
      )
      if (ret.incomplete)
        console.log(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `[goTo] incomplete path from ${c.pos.toString()}(${c.name}) to ${to.toString()}`
        )
      if (!ret.path.length || ret.path[0].roomName != fromRoom) return ERR_NO_PATH

      let path = "" //MAYBE: multi room path
      let cur = { x: c.pos.x, y: c.pos.y }
      for (const next of ret.path) {
        if (next.roomName != fromRoom) break
        path = getDirectionTo(cur, next).toString() + path
        cur = next
      }
      mem[8] = path
    }
  }

  const path = mem[8]
  setMem(mem, defaultM)
  if (opts.reusePath) mem[8] = path
  mem[7] = Game.time //NOTE: assume will move to allow swap

  function go(dir: DirectionConstant): boolean {
    const dest = getToDirection(c.pos, dir)
    if (!dest) return true

    if (!isTerrainWalkableAt(dest)) return false
    //FIXME: if structure here
    for (const o of lookForInRange(dest, LOOK_CREEPS, 1)) {
      if (o === c || !o.my) continue
      const oMem = getMemory(o)
      if (!oMem.length || oMem[7] != Game.time || o.pos.isEqualTo(dest)) continue
      const oDir = Number(oMem[8][oMem[8].length - 1]) as DirectionConstant
      if (!getToDirection(o.pos, oDir)?.isEqualTo(dest)) continue
      //TODO: if c.priority > o.priority moveTo(o)
      return false
    }

    const blocker = dest.lookFor(LOOK_CREEPS)[0] as Creep | undefined
    if (blocker && (blocker.my || !c.room.controller?.my || !c.room.controller.safeMode)) {
      if (!blocker.my) return false
      const bMem = getMemory(blocker)
      if (
        opts.noPush ||
        blocker.fatigue ||
        blocker.spawning ||
        !bMem.length ||
        (bMem[7] != Game.time &&
          (bMem[0] != c.pos.roomName ||
            !c.pos.inRangeTo(bMem[1], bMem[2], bMem[3]) ||
            goTo(blocker, c.pos, getMemory, roomMatrixCache, {
              range: 0,
              noPush: true,
            }) < OK) &&
          goTo(blocker, new RoomPosition(bMem[1], bMem[2], bMem[0]), getMemory, roomMatrixCache, {
            range: 0,
            priority: bMem[4],
            ignoreCreeps: true,
          }) < OK)
      ) {
        if (bMem.length) setMem(getMemory(blocker), bMem) //NOTE: restore full range
        return false
      }
    }
    return true
  }

  const dir = Number(path[path.length - 1]) as DirectionConstant
  if (!go(dir)) {
    mem[7] = 0
    if (opts.ignoreCreeps === undefined) {
      opts.ignoreCreeps = false
      getMemory(c).length = 0
      return goTo(c, target, getMemory, roomMatrixCache, opts)
    }
    //TODO: fix path around
    return ERR_NOT_IN_RANGE
  }

  return c.move(dir)
}
