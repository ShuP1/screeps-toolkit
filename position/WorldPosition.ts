import { ROOM_MAX, ROOM_MIN } from "./constants"
import { HasPos, RoomName } from "./types"
import { getChebyshevDist, getDirectionTo, normalizePos, parseRoomName } from "./utils"

/** Uniform screep's world position with E0S0 as origin. */
export class WorldPosition {
  constructor(readonly x: number, readonly y: number) {}

  /**
   * Extract room name from this.
   * In sim, it will return E0S0.
   * @returns the room name
   */
  getRoomName() {
    const [x, y] = [Math.floor(this.x / 50), Math.floor(this.y / 50)]
    let result = ""
    result += x < 0 ? "W" + String(~x) : "E" + String(x)
    result += y < 0 ? "N" + String(~y) : "S" + String(y)
    return result as RoomName
  }

  /**
   * Convert a {@link RoomPosition} to {@link WorldPosition}
   * @param at Object containing a position
   * @returns this
   */
  static fromRoom(at: RoomPosition | HasPos) {
    const { x, y, roomName } = normalizePos(at)
    if (x < ROOM_MIN || x > ROOM_MAX) throw new RangeError(`x value ${x} not in range`)
    if (y < ROOM_MIN || y > ROOM_MAX) throw new RangeError(`y value ${y} not in range`)
    if (roomName == "sim") return new WorldPosition(x, y)
    let [, h, wx, v, wy] = parseRoomName(roomName as RoomName)
    if (h == "W") wx = ~wx
    if (v == "N") wy = ~wy
    return new WorldPosition(50 * wx + x, 50 * wy + y)
  }

  /**
   * Convert this to {@link RoomPosition}
   * @returns a RoomPosition representing same position
   */
  toRoom() {
    let [rx, x] = [Math.floor(this.x / 50), this.x % 50]
    let [ry, y] = [Math.floor(this.y / 50), this.y % 50]
    if (rx < 0 && x < 0) x = 49 - ~x
    if (ry < 0 && y < 0) y = 49 - ~y
    return new RoomPosition(x, y, this.getRoomName())
  }

  getRangeTo(to: WorldPosition) {
    return getChebyshevDist(this, to)
  }
  inRangeTo(to: WorldPosition, range = 1) {
    return this.getRangeTo(to) <= range
  }

  getDirectionTo(to: WorldPosition) {
    return getDirectionTo(this, to)
  }

  toString() {
    return `[world pos ${this.x},${this.y}]`
  }
}

/**
 * Functional helper to compute a range between two {@link RoomPosition}.
 * Support multi-room thanks to {@link WorldPosition}
 * @param f initial position
 * @returns a function taking position and returning the distance to {@link f}
 */
export function rangeTo(f: RoomPosition | HasPos) {
  const fw = WorldPosition.fromRoom(f)
  return (t: RoomPosition | HasPos) => fw.getRangeTo(WorldPosition.fromRoom(t))
}
