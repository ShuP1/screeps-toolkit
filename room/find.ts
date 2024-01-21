import { inRoomRangeArea, inRoomRangeXY } from "../position/utils"
import { getRoom } from "./utils"

/**
 * Run {@link Room.lookAtArea} on a given range bounded to room borders
 * @param center Center position
 * @param range Optional range
 * @returns List of results
 */
export function lookInRange(center: RoomPosition, range = 1) {
  return getRoom(center.roomName)?.lookAtArea(...inRoomRangeArea(center, range), true) ?? []
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
  const room = getRoom(center.roomName)
  if (!room) return
  for (const { x, y } of inRoomRangeXY(center, range)) {
    yield* room.lookForAt(type, x, y)
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
  return (
    getRoom(center.roomName)?.lookForAtArea(type, ...inRoomRangeArea(center, range), true) ?? []
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
}
