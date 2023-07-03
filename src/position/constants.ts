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
