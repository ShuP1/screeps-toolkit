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
 * Run {@link Room.lookForAtArea} on a given range bounded to room borders
 * @param pos Center position
 * @param type LOOK_* constant
 * @param range Optional range
 * @returns List of results
 */
export function lookForInRange<T extends keyof AllLookAtTypes>(
  pos: RoomPosition,
  type: T,
  range = 1
) {
  const { x, y, roomName } = pos
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
 * Run {@link Room.lookForAtArea} {@link LOOK_STRUCTURES} on a given range bounded to room borders
 * @param pos Center position
 * @param type STRUCTURE_* constant
 * @param range Optional range
 * @returns List of structures
 */
export function lookForStructureInRange<T extends keyof ConcreteStructureMap>(
  pos: RoomPosition,
  type: T,
  range = 1
) {
  const { x, y, roomName } = pos
  const room = Game.rooms[roomName] as Room | undefined
  return (room
    ?.lookForAtArea(
      LOOK_STRUCTURES,
      Math.max(y - range, ROOM_MIN),
      Math.max(x - range, ROOM_MIN),
      Math.min(y + range, ROOM_MAX),
      Math.min(x + range, ROOM_MAX),
      true
    )
    .filter((l) => l.structure.structureType == type) ?? []) as LookForAtAreaResultArray<
    ConcreteStructureMap[T],
    "structure"
  >
}
