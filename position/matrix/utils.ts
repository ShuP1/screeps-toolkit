import { DIRECTION_OFFSETS_LIST, ROOM_MIN, ROOM_SIZE } from "../constants"
import { Coordinates, RoomName } from "../types"
import { MATRIX_MAX } from "./constants"

/**
 * Convert {@link RoomTerrain} to {@link CostMatrix}
 * @param roomName target room name
 * @param plain value for {@link TERRAIN_MASK_PLAIN}
 * @param swamp value for {@link TERRAIN_MASK_SWAMP}
 * @param wall value for {@link TERRAIN_MASK_WALL}
 * @param exclude optional matrix with non-zero values considered as wall
 * @returns a matrix of the terrain for the given room
 */
export function getRoomTerrainMatrix(
  roomName: RoomName,
  plain = 1,
  swamp = 5,
  wall = MATRIX_MAX,
  exclude?: CostMatrix
): CostMatrix {
  const cm = new PathFinder.CostMatrix()
  const terrain = Game.map.getRoomTerrain(roomName)
  for (let y = 0; y < ROOM_SIZE; ++y) {
    for (let x = 0; x < ROOM_SIZE; ++x) {
      const t = terrain.get(x, y)
      cm.set(
        x,
        y,
        t == TERRAIN_MASK_WALL || exclude?.get(x, y)
          ? wall
          : t == TERRAIN_MASK_SWAMP
          ? swamp
          : plain
      )
    }
  }
  return cm
}

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

function getMatrixIndex(x: number, y: number) {
  x = x | 0
  y = y | 0
  return x * ROOM_SIZE + y
}
function getMatrixCoords(i: number): Coordinates {
  i = i | 0
  return { x: (i / ROOM_SIZE) | 0, y: i % ROOM_SIZE }
}

/**
 * Create a cost matrix from a room terrain.
 * NOTE: Terrain values between 2 and 254 are considered as swamp.
 * @param from The coordinates to calculate the distance from
 * @param terrain The room terrain
 * @param limit The maximum distance to calculate
 * @returns The distance matrix
 */
export function makeRoomDistanceMatrix(
  from: Coordinates | Coordinates[],
  terrain: CostMatrix,
  limit = MATRIX_MAX - 1
): CostMatrix {
  if (!Array.isArray(from)) from = [from]

  const limit_ = Math.min(limit, MATRIX_MAX - 1)
  const cm = new PathFinder.CostMatrix()
  for (let x = 0; x < ROOM_SIZE; ++x) {
    for (let y = 0; y < ROOM_SIZE; ++y) {
      cm.set(x, y, terrain.get(x, y) == MATRIX_MAX ? MATRIX_MAX : limit_)
    }
  }

  const SWAMP_RATIO = CONSTRUCTION_COST_ROAD_SWAMP_RATIO
  const queues = new Array(SWAMP_RATIO + 1).fill(0).map(() => new Array<number>())
  queues[0] = from.map((p) => getMatrixIndex(p.x, p.y))

  for (let dist = 0; dist < limit_ && queues.some((q) => q.length > 0); dist++) {
    const open = queues[0]
    const next = queues[1]
    const swamp = queues[SWAMP_RATIO]

    for (const idx of open) {
      const { x, y } = getMatrixCoords(idx)
      for (const { x: dx, y: dy } of DIRECTION_OFFSETS_LIST) {
        const nx = x + dx
        const ny = y + dy
        if (nx <= 0 || nx >= ROOM_SIZE - 1 || ny <= 0 || ny >= ROOM_SIZE - 1) continue

        const cv = cm.get(nx, ny)
        const is_swamp = terrain.get(nx, ny) > 1
        const nv = dist + (is_swamp ? SWAMP_RATIO : 1)
        if (cv === MATRIX_MAX || nv >= cv) continue

        cm.set(nx, ny, nv)
        if (is_swamp) {
          swamp.push(getMatrixIndex(nx, ny))
        } else {
          next.push(getMatrixIndex(nx, ny))
        }
      }
    }

    for (let i = 0; i < SWAMP_RATIO; ++i) {
      queues[i] = queues[i + 1]
    }
    open.length = 0
    queues[SWAMP_RATIO] = open
  }
  for (const p of from) cm.set(p.x, p.y, 0)
  return cm
}

/**
 * Get the distance value of a position from a cost matrix.
 * @param pos The position to get the distance from
 * @param distanceMap The distance matrix
 * @returns The distance value
 */
export function getDistanceMatrixValue(pos: Coordinates, distanceMap: CostMatrix) {
  let v = distanceMap.get(pos.x, pos.y)
  if (v !== MATRIX_MAX) return v
  for (const { x: dx, y: dy } of DIRECTION_OFFSETS_LIST) {
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (nx >= 0 && nx < ROOM_SIZE && ny >= 0 && ny >= ROOM_SIZE)
      v = Math.min(v, distanceMap.get(nx, ny))
  }
  return Math.min(v + 1, MATRIX_MAX)
}

/**
 * Display values of a cost matrix on the map using {@link RoomVisual}.
 * @param cm The cost matrix to visualize
 * @param ignore Values to ignore
 * @param style The style for the text visualization
 * @param visual The RoomVisual instance to use for drawing
 */
export function visualizeCostMatrixValues(
  cm: CostMatrix,
  ignore = MATRIX_MAX,
  style: TextStyle = { opacity: 0.5 },
  visual = new RoomVisual()
) {
  for (let y = 0; y < ROOM_SIZE; ++y) {
    for (let x = 0; x < ROOM_SIZE; ++x) {
      const v = cm.get(x, y)
      if (v === ignore) continue
      visual.text(v.toString(), x, y, style)
    }
  }
}
