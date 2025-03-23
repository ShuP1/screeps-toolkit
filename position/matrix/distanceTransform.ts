import { ROOM_SIZE } from "../constants"
import { RoomName } from "../types"
import { getRoomTerrainMatrix } from "./utils"

/**
 * Apply distance transform in-place on a given matrix.
 *
 * Output values are distance to the nearest wall.
 * @param cm initial matrix with 1 representing walkable. Modified in-place
 * @param oob out of bound value (optional: default to 255)
 * @returns modified cost matrix
 */
export function applyDistanceTransform(cm: CostMatrix, oob = 255): CostMatrix {
  // Variables to represent the 3x3 neighborhood of a pixel.
  let UL, U, UR: number
  let L, mid, R: number
  let BL, B, BR: number

  for (let y = 0; y < ROOM_SIZE; ++y) {
    for (let x = 0; x < ROOM_SIZE; ++x) {
      if (cm.get(x, y) !== 0) {
        UL = cm.get(x - 1, y - 1)
        U = cm.get(x, y - 1)
        UR = cm.get(x + 1, y - 1)
        L = cm.get(x - 1, y)
        if (y == 0) {
          UL = oob
          U = oob
          UR = oob
        }
        if (x == 0) {
          UL = oob
          L = oob
        }
        if (x == 49) {
          UR = oob
        }
        cm.set(x, y, Math.min(UL, U, UR, L, 254) + 1)
      }
    }
  }
  for (let y = ROOM_SIZE - 1; y >= 0; --y) {
    for (let x = ROOM_SIZE - 1; x >= 0; --x) {
      mid = cm.get(x, y)
      R = cm.get(x + 1, y)
      BL = cm.get(x - 1, y + 1)
      B = cm.get(x, y + 1)
      BR = cm.get(x + 1, y + 1)
      if (y == 49) {
        BL = oob
        B = oob
        BR = oob
      }
      if (x == 49) {
        R = oob
        BR = oob
      }
      if (x == 0) {
        BL = oob
      }
      const value = Math.min(mid, R + 1, BL + 1, B + 1, BR + 1)
      cm.set(x, y, value)
    }
  }
  return cm
}

/**
 * Apply distance transform algorithm for a given room.
 * @param roomName name of the target room. No visibility is needed
 * @param exclude optional matrix with non-zero values considered as wall
 * @returns A matrix where values are distance to the nearest wall
 */
export function getRoomDistanceTransform(roomName: RoomName, exclude?: CostMatrix): CostMatrix {
  return applyDistanceTransform(getRoomTerrainMatrix(roomName, 1, 1, 0, exclude))
}
