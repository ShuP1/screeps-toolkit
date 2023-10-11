import { ROOM_MIN, ROOM_SIZE } from "../constants"

/**
 * Iterator over a matrix cells
 * @param cm given cost matrix
 * @yields position and value
 */
export function* iterateMatrix(cm: CostMatrix) {
  for (let y = ROOM_MIN; y < ROOM_SIZE; ++y) {
    for (let x = ROOM_MIN; x < ROOM_SIZE; ++x) {
      yield { x, y, v: cm.get(x, y) }
    }
  }
}
