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

/**
 * Return a function caching {@link Game.map.visual} for a given interval
 * @param draw a function to draw the visuals
 * @param interval optional: interval to cache the visuals
 * @returns a cached function to draw the visuals
 */
export function cacheMapVisual(draw: () => void, interval = 10) {
  let exported: string | undefined
  return () => {
    if (!exported || Game.time % interval === 0) {
      draw()
      exported = Game.map.visual.export()
    } else {
      Game.map.visual.import(exported)
    }
  }
}
