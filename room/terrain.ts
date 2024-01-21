import { Coordinates } from "../position"

/**
 * Check if terrain value is wall
 * @param terrain {@link RoomTerrain.get} value
 * @returns is a terrain wall
 */
export const isTerrainWall = (terrain: number) => !!(terrain & TERRAIN_MASK_WALL)

/**
 * Check if positions are {@link TERRAIN_MASK_SWAMP}
 * @returns a function to check terrain at position
 */
export function getIsSwamp() {
  let t: RoomTerrain | undefined
  let r: string
  return ({ x, y, roomName }: RoomPosition) => {
    if (!t || r !== roomName) {
      t = Game.map.getRoomTerrain(roomName)
      r = roomName
    }
    return !!(t.get(x, y) & TERRAIN_MASK_SWAMP)
  }
}
/**
 * Check than coordinates are not {@link TERRAIN_MASK_WALL}
 * @param roomName target room name
 * @returns a function to check terrain at coordinates
 */
export function getIsTerrainWalkable(roomName: string) {
  const t = Game.map.getRoomTerrain(roomName)
  return ({ x, y }: Coordinates) => !(t.get(x, y) & TERRAIN_MASK_WALL)
}
/**
 * Check than position is not {@link TERRAIN_MASK_WALL}
 * @param p target position
 * @returns can walk at position terrain
 */
export function isTerrainWalkableAt(p: RoomPosition) {
  return !(Game.map.getRoomTerrain(p.roomName).get(p.x, p.y) & TERRAIN_MASK_WALL)
}
