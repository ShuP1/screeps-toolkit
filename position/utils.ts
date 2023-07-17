import { RoomName, Coordinates } from "./types"
import { ROOM_MIN, ROOM_MAX, ROOM_SIZE } from "./constants"

/**
 * Whether or not this position is an exit. Ignoring terrain.
 * @param at A room position
 * @returns Is this position at the edge of the room
 */
export function isExit(at: Coordinates) {
  const { x, y } = at
  return x <= ROOM_MIN || x >= ROOM_MAX || y <= ROOM_MIN || y >= ROOM_MAX
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
 * Correct distance for creep movements.
 * @param a First point
 * @param b Second point
 * @returns Chebyshev distance between those points
 */
export function getChebyshevDist(a: Coordinates, b: Coordinates) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}
/**
 * Distance when moving only vertically or horizontally.
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
  const [dx, dy] = [from.x - to.x, from.y - to.y]
  const arc = Math.atan2(dy, dx) * (180 / Math.PI)
  const dir = Math.round(arc / 45 + 3)
  return dir == 0 ? 8 : (dir as DirectionConstant)
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
  if (x < ROOM_MIN || y < ROOM_MIN || x > ROOM_MAX || y < ROOM_MAX) return undefined
  return new RoomPosition(x, y, pos.roomName)
}

/**
 * List all {@link RoomPosition} in a given square
 * @param center middle point
 * @param range positive integer
 * @yields a valid position
 */
export function* inRoomRange(center: RoomPosition, range = 1) {
  const mx = Math.min(ROOM_MAX, center.x + range)
  const my = Math.min(ROOM_MAX, center.y + range)
  for (let x = Math.max(ROOM_MIN, center.x - range); x <= mx; x++) {
    for (let y = Math.max(ROOM_MIN, center.y - range); y <= my; y++) {
      yield new RoomPosition(x, y, center.roomName)
    }
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
