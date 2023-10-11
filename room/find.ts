import { ROOM_MAX, ROOM_MIN } from "../position/constants"

/**
 * Run {@link Room.lookAtArea} on a given range bounded to room borders
 * @param pos Center position
 * @param range Optional range
 * @returns List of results
 */
export function lookInRange(pos: RoomPosition, range = 1) {
  const { x, y, roomName } = pos
  const room = Game.rooms[roomName] as Room | undefined
  return (
    room?.lookAtArea(
      Math.max(y - range, ROOM_MIN),
      Math.max(x - range, ROOM_MIN),
      Math.min(y + range, ROOM_MAX),
      Math.min(x + range, ROOM_MAX),
      true
    ) ?? []
  )
}

/**
 * Run {@link Room.lookForAt} on a given range bounded to room borders
 * @param center Center position
 * @param type LOOK_* constant
 * @param range Optional range
 * @yields Iterator of results
 */
export function* lookForInRange<T extends keyof AllLookAtTypes>(
  center: RoomPosition,
  type: T,
  range = 1
) {
  const room = Game.rooms[center.roomName] as Room | undefined
  if (!room) return
  const mx = Math.min(ROOM_MAX, center.x + range)
  const my = Math.min(ROOM_MAX, center.y + range)
  for (let x = Math.max(ROOM_MIN, center.x - range); x <= mx; x++) {
    for (let y = Math.max(ROOM_MIN, center.y - range); y <= my; y++) {
      yield* room.lookForAt(type, x, y)
    }
  }
}

/**
 * Run {@link Room.lookForAtArea} on a given range bounded to room borders
 * @param center Center position
 * @param type LOOK_* constant
 * @param range Optional range
 * @returns List of results
 */
export function lookForMatrixInRange<T extends keyof AllLookAtTypes>(
  center: RoomPosition,
  type: T,
  range = 1
) {
  const { x, y, roomName } = center
  const room = Game.rooms[roomName] as Room | undefined
  return (
    room?.lookForAtArea(
      type,
      Math.max(y - range, ROOM_MIN),
      Math.max(x - range, ROOM_MIN),
      Math.min(y + range, ROOM_MAX),
      Math.min(x + range, ROOM_MAX),
      true
    ) ?? []
  )
}

/**
 * Run {@link Room.lookForAt} {@link LOOK_STRUCTURES} on a given range bounded to room borders
 * @param center Center position
 * @param type STRUCTURE_* constant
 * @param range Optional range
 * @yields Iterator of structures
 */
export function* lookForStructureInRange<T extends keyof ConcreteStructureMap>(
  center: RoomPosition,
  type: T,
  range = 1
) {
  for (const s of lookForInRange(center, LOOK_STRUCTURES, range)) {
    if (s.structureType == type) yield s as ConcreteStructureMap[T]
  }
}
/**
 * Run {@link RoomPosition.lookFor} {@link LOOK_STRUCTURES} on a given pos
 * @param pos Target position
 * @param type STRUCTURE_* constant
 * @yields Iterator of structures
 */
export function* lookForStructureAt<T extends keyof ConcreteStructureMap>(
  pos: RoomPosition,
  type: T
) {
  for (const s of pos.lookFor(LOOK_STRUCTURES)) {
    if (s.structureType == type) yield s as ConcreteStructureMap[T]
  }
  pos.lookFor(LOOK_TERRAIN)
}

/**
 * Check if the terrain is swampy.
 * @param pos Target position
 * @returns Whether or not this position is swampy
 */
export function isSwampAt(pos: RoomPosition) {
  const { roomName, x, y } = pos
  return !!(new Room.Terrain(roomName).get(x, y) & TERRAIN_MASK_SWAMP)
}
/**
 * Check if the terrain is not a wall. Does not check for {@link StructureWall}.
 * @param pos Target position
 * @returns Whether or not this position is not {@link TERRAIN_MASK_WALL}
 */
export function isTerrainWalkableAt(pos: RoomPosition) {
  const { roomName, x, y } = pos
  return !(new Room.Terrain(roomName).get(x, y) & TERRAIN_MASK_WALL)
}
