/** Just a 2d point */
export interface Coordinates {
  x: number
  y: number
}

/** A valid {@link Room.name} */
export type RoomName = string & Tag.OpaqueTag<Room>
