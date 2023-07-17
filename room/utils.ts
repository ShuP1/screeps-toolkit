import { RoomName } from "../position/types"

/**
 * Find neighbor rooms without need for visibility.
 * @param from starting room
 * @param dist optional: number of rooms from starting point
 * @param pred optional: condition for a room to be visited
 * @returns a set of neighbor room names excluding {@link from}
 */
export function describeAdjacentRooms(
  from: RoomName,
  dist = 1,
  pred: (r: RoomName, dist: number) => boolean = () => true
) {
  const res = new Set([from])
  let q = [from]
  for (let i = 1; i <= dist; i++) {
    const nq = []
    for (const from of q) {
      const exits = Game.map.describeExits(from)
      for (const exit in exits) {
        const to = exits[exit as ExitKey] as RoomName | undefined
        if (!to || res.has(to) || !pred(to, i)) continue
        res.add(to)
        nq.push(to)
      }
    }
    q = nq
  }
  res.delete(from)
  return res
}
