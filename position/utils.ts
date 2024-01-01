import { RoomName, Coordinates, Area } from "./types"
import { ROOM_MIN, ROOM_MAX, ROOM_SIZE } from "./constants"
import { clamp } from "../utils/number"

/**
 * Whether or not this position is an exit. Ignoring terrain.
 * @param at A room position
 * @param range Optional distance to exits
 * @returns Is this position at the edge of the room
 */
export function isExit(at: Coordinates, range = 0) {
  const { x, y } = at
  return (
    x <= ROOM_MIN + range || x >= ROOM_MAX - range || y <= ROOM_MIN + range || y >= ROOM_MAX - range
  )
}
/**
 * Whether or not this position is inside of a room.
 * @param at A room position
 * @returns Is this position valid room coordinates
 */
export function isInRoom(at: Coordinates) {
  const { x, y } = at
  return x >= ROOM_MIN && y >= ROOM_MIN && x < ROOM_MAX && y < ROOM_MAX
}

/**
 * Extract position from an object with a position
 * @param it Object with a position
 * @returns The RoomPosition
 */
export function normalizePos(it: RoomPosition | _HasRoomPosition): RoomPosition {
  if (!(it instanceof RoomPosition)) {
    return it.pos
  }
  return it
}

const ROOM_REGEX = /^([WE])([0-9]+)([NS])([0-9]+)$/
/**
 * Split a room name in parts
 * @param roomName Valid name of a room
 * @returns Room name parts [full string, WE, x, NS, y]
 */
export function parseRoomName(roomName: RoomName) {
  return roomName.match(ROOM_REGEX) as [string, "W" | "E", number, "N" | "S", number]
}

/**
 * Convert a room name into a 2d point
 * @param roomName Valid name of a room
 * @returns 2d coordinates (1:ROOM_SIZE scale)
 */
export function getRoomNameCoords(roomName: RoomName): Coordinates {
  let [, h, x, v, y] = parseRoomName(roomName)
  if (h == "W") x = ~x
  if (v == "N") y = ~y
  return { x, y }
}

/** Room type information without visibility required */
export enum RoomSectorKind {
  /** With portals and terminal */
  Intersection = -2,
  /** With deposits and powerBanks */
  Highway,
  /** With a controller aka normal */
  Controller,
  /** With sourceKeepers and mineral */
  SourceKeeper,
  /** With portals at sector's center */
  Center,
}
/**
 * Get room type information without visibility required.
 * @param name Valid name of a room
 * @returns an enum with room kind
 */
export function getRoomSectorKind(name: RoomName) {
  if (name == "sim") return RoomSectorKind.Controller
  const [, , wx, , wy] = parseRoomName(name)
  const [sx, sy] = [wx % 10, wy % 10]
  if (sx == 0 || sy == 0)
    return sx == 0 && sy == 0 ? RoomSectorKind.Intersection : RoomSectorKind.Highway
  if (sx >= 4 && sx <= 6 && sy >= 4 && sy <= 6)
    return sx == 5 && sy == 5 ? RoomSectorKind.Center : RoomSectorKind.SourceKeeper
  return RoomSectorKind.Controller
}

/**
 * Compute center position of a room
 * @param name valid room name
 * @returns position at the middle of this room
 */
export const getRoomCenter = (name: RoomName) =>
  new RoomPosition(ROOM_SIZE / 2, ROOM_SIZE / 2, name)

/**
 * Distance when moving only vertically, horizontally and diagonally.
 * Correct distance for in room creep movements.
 * @param a First point
 * @param b Second point
 * @returns Chebyshev distance between those points
 */
export function getChebyshevDist(a: Coordinates, b: Coordinates) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}
/**
 * Distance when moving only vertically or horizontally.
 * Correct distance for inter room creep movements.
 * @param a First point
 * @param b Second point
 * @returns Manhattan distance between those points
 */
export function getManhattanDist(a: Coordinates, b: Coordinates) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
/**
 * Distance when moving at any angle.
 * @param a First point
 * @param b Second point
 * @returns Euclidean distance between those points
 */
export function getEuclidDist(a: Coordinates, b: Coordinates) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Compute the nearest angle between two point round to 8 directions
 * @param from First point
 * @param to Second point
 * @returns Direction constant
 */
export function getDirectionTo(from: Coordinates, to: Coordinates) {
  const dx = to.x - from.x,
    dy = to.y - from.y
  const adx = Math.abs(dx),
    ady = Math.abs(dy)
  if (adx > ady * 2) return dx > 0 ? RIGHT : LEFT
  if (ady > adx * 2) return dy > 0 ? BOTTOM : TOP
  if (dx > 0 && dy > 0) return BOTTOM_RIGHT
  if (dx > 0 && dy < 0) return TOP_RIGHT
  if (dx < 0 && dy > 0) return BOTTOM_LEFT
  return TOP_LEFT
}

const DIR_OFFSET: Record<DirectionConstant, Coordinates> = {
  [TOP]: { x: 0, y: -1 },
  [TOP_RIGHT]: { x: 1, y: -1 },
  [RIGHT]: { x: 1, y: 0 },
  [BOTTOM_RIGHT]: { x: 1, y: 1 },
  [BOTTOM]: { x: 0, y: 1 },
  [BOTTOM_LEFT]: { x: -1, y: 1 },
  [LEFT]: { x: -1, y: 0 },
  [TOP_LEFT]: { x: -1, y: -1 },
}
/**
 * Compute position in a given direction
 * @param pos start position
 * @param d direction constant
 * @returns destination position
 */
export function getToDirection(pos: RoomPosition, d: DirectionConstant) {
  const x = pos.x + DIR_OFFSET[d].x
  const y = pos.y + DIR_OFFSET[d].y
  return isInRoom({ x, y }) ? new RoomPosition(x, y, pos.roomName) : undefined
}

/**
 * Clamp coordinates in room range.
 * @param at point to clamp
 * @returns clamped coordinates
 */
export function clampInRoom(at: Coordinates): Coordinates {
  const { x, y } = at
  return { x: clamp(ROOM_MIN, x, ROOM_MAX), y: clamp(ROOM_MIN, y, ROOM_MAX) }
}

/**
 * List all {@link RoomPosition} in a given square clamped to room borders
 * @param center middle point
 * @param range positive integer
 * @yields a valid position
 */
export function* inRoomRange(center: RoomPosition, range = 1) {
  for (const { x, y } of inRoomRangeXY(center, range)) {
    yield new RoomPosition(x, y, center.roomName)
  }
}
/**
 * List all {@link Coordinates} in a given square clamped to room borders
 * @param center middle point
 * @param range positive integer
 * @yields a coordinate in room
 */
export function* inRoomRangeXY(center: Coordinates, range = 1) {
  const mx = Math.min(ROOM_MAX, center.x + range)
  const my = Math.min(ROOM_MAX, center.y + range)
  for (let x = Math.max(ROOM_MIN, center.x - range); x <= mx; x++) {
    for (let y = Math.max(ROOM_MIN, center.y - range); y <= my; y++) {
      yield { x, y } as Coordinates
    }
  }
}

/**
 * Get an area in a given square clamped to room borders.
 * @param center middle point
 * @param range positive integer
 * @returns area in room
 */
export function inRoomRangeArea(center: Coordinates, range = 1): Area {
  const { x, y } = center
  return [
    Math.max(y - range, ROOM_MIN),
    Math.max(x - range, ROOM_MIN),
    Math.min(y + range, ROOM_MAX),
    Math.min(x + range, ROOM_MAX),
  ]
}

/**
 * List all {@link RoomPosition} at a given square border excluding out of room
 * @param center middle point
 * @param range positive integer
 * @yields a valid position
 */
export function* atRoomRange(center: RoomPosition, range = 1) {
  if (!range) {
    yield center
    return
  }
  const { x: cx, y: cy, roomName } = center
  function* send(x: number, y: number) {
    if (isInRoom({ x, y })) yield new RoomPosition(x, y, roomName)
  }
  for (let d = -range; d < range; d++) {
    yield* send(cx + d, cy + range)
    yield* send(cx + range, cy - d)
    yield* send(cx - d, cy - range)
    yield* send(cx - range, cy + d)
  }
}

/**
 * Get all directions for nearest to oppositive of {@link d}.
 * @param d nearest direction
 * @returns a sorted array of directions
 */
export const getDirectionsSorted = (d: DirectionConstant) => [
  d,
  rotateDirection(d, 1),
  rotateDirection(d, -1),
  rotateDirection(d, 2),
  rotateDirection(d, -2),
  rotateDirection(d, 3),
  rotateDirection(d, -3),
  rotateDirection(d, 4),
]
function rotateDirection(d: DirectionConstant, n: number) {
  return (((((d + n - 1) % 8) + 8) % 8) + 1) as DirectionConstant
}
