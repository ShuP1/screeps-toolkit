import { RoomName } from "../position/types"

/**
 * Find neighbor rooms without need for visibility.
 * @param origin starting room
 * @param dist optional: number of rooms from starting point
 * @param pred optional: condition for a room to be visited
 * @returns a set of neighbor room names excluding {@link origin}
 */
export function describeAdjacentRooms(
  origin: RoomName,
  dist = 1,
  pred: (r: RoomName, dist: number) => boolean = () => true
) {
  const res = new Set([origin])
  let q = [origin]
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
  res.delete(origin)
  return res
}

/**
 * Guess sources capacity based on room ownership.
 * @param room a room (maybe partial)
 * @returns a number of energy units
 */
export function getRoomSourcesCapacity(room: RoomOwnershipData) {
  if (!room.controller) return SOURCE_ENERGY_KEEPER_CAPACITY
  if (room.controller.owner || room.controller.reservation) return SOURCE_ENERGY_CAPACITY
  return SOURCE_ENERGY_NEUTRAL_CAPACITY
}
interface RoomOwnershipData {
  controller?: { owner?: object; reservation?: object }
}
