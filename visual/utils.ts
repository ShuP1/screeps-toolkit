/**
 * Draw a position's path as {@link RoomVisual}
 * @param path a list of position
 * @param style the (optional) style.
 */
export function drawRoomPathVisual(path: RoomPosition[], style?: PolyStyle) {
  let i = 0
  while (i < path.length && i !== -1) {
    const r = path[i].roomName
    const end = path.findIndex((p, j) => j > i && p.roomName !== r)
    new RoomVisual(r).poly(path.slice(i, end > 0 ? end : undefined), style)
    i = end
  }
}
