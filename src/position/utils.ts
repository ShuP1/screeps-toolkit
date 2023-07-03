import { HasPos, RoomName, Coordinates } from "./types"
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
export function normalizePos(it: RoomPosition | HasPos): RoomPosition {
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
