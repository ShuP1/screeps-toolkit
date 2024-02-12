import { Coordinates, ROOM_MAX, RoomName } from "../position"

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

/**
 * Get exits coordinates from room name
 * @param name target room name
 * @yields exits coordinates
 */
export function* getExits(name: RoomName) {
  const t = Game.map.getRoomTerrain(name)
  for (let i = 0; i <= ROOM_MAX; i++) {
    if (!(t.get(0, i) & TERRAIN_MASK_WALL)) yield { x: 0, y: i }
    if (!(t.get(i, 0) & TERRAIN_MASK_WALL)) yield { x: i, y: 0 }
    if (!(t.get(ROOM_MAX, i) & TERRAIN_MASK_WALL)) yield { x: ROOM_MAX, y: i }
    if (!(t.get(i, ROOM_MAX) & TERRAIN_MASK_WALL)) yield { x: i, y: ROOM_MAX }
  }
}
