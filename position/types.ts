/** Just a 2d point */
export interface Coordinates {
  x: number
  y: number
}
export interface HasPos {
  pos: RoomPosition
}

export type RoomName = string & Tag.OpaqueTag<Room>
