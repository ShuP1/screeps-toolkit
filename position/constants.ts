import { Coordinates } from "./types"

export const ROOM_SIZE = 50
export const ROOM_MIN = 0
export const ROOM_MAX = ROOM_SIZE - 1

/**
 * Map direction to unicode arrow symbol
 * @author warinternal 20170511
 */
export const DIRECTION_ARROWS: Record<DirectionConstant, string> = {
  [TOP]: "\u2191",
  [TOP_RIGHT]: "\u2197",
  [RIGHT]: "\u2192",
  [BOTTOM_RIGHT]: "\u2198",
  [BOTTOM]: "\u2193",
  [BOTTOM_LEFT]: "\u2199",
  [LEFT]: "\u2190",
  [TOP_LEFT]: "\u2196",
}

/**
 * Map direction to coordinate offsets
 */
export const DIRECTION_OFFSETS: Readonly<Record<DirectionConstant, Coordinates>> = {
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
 * List of direction offsets
 */
export const DIRECTION_OFFSETS_LIST: Readonly<Coordinates[]> = Object.values(DIRECTION_OFFSETS)
