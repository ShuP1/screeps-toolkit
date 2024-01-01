/** Just a 2d point */
export interface Coordinates {
  x: number
  y: number
}
/** Just a 2d rectangle */
export type Area = [top: number, left: number, bottom: number, right: number]

/** A valid {@link Room.name} */
export type RoomName = string & Tag.OpaqueTag<Room>
