import { ROOM_SIZE, DIRECTION_OFFSETS, DIRECTION_OFFSETS_LIST } from "../constants"
import { RoomName, Coordinates } from "../types"
import { MATRIX_MAX } from "./constants"
export { MATRIX_MAX } from "./constants"

const ROOMS_RADIUS = 4
const ROOMS_SIZE = ROOMS_RADIUS * 2 + 1
const ROOM_SIZE_IN = ROOM_SIZE - 1
const SIZE = ROOM_SIZE_IN * ROOMS_SIZE

/** 4 rooms radius grid of uint8 */
export type RemotesCostMatrix = Uint8Array & Tag.OpaqueTag<"RemotesMatrix">
/** 4 rooms radius grid of names */
export type RemotesNamesMatrix = (RoomName | undefined)[] & Tag.OpaqueTag<"RemotesNamesMatrix">

/**
 * Create a 4 rooms radius grid of names from a starting room
 * @param from Center room name
 * @param pred A predicate function to determine if a room should be included
 * @param describeExits {@link Game.map.describeExits} but can be overridden for caching or other purposes
 * @returns A 4 rooms radius grid of names around the starting room
 */
export function makeNeighborRemotesNamesMatrix(
  from: RoomName,
  pred: (roomName: RoomName, from: RoomName, dist: number) => boolean = () => true,
  describeExits = (roomName: RoomName) =>
    Object.entries(Game.map.describeExits(roomName)) as [string | number, string][]
) {
  const roomNames = new Array(ROOMS_SIZE * ROOMS_SIZE).fill(undefined) as RemotesNamesMatrix
  roomNames[ROOMS_RADIUS * ROOMS_SIZE + ROOMS_RADIUS] = from
  let q = [{ roomName: from, x: ROOMS_RADIUS, y: ROOMS_RADIUS }]
  for (let distance = 1; q.length; distance++) {
    const nq = []
    for (const { roomName: prev, x: px, y: py } of q) {
      for (const [exit, roomName] of describeExits(prev) as [ExitConstant | ExitKey, RoomName][]) {
        const x = px + DIRECTION_OFFSETS[exit].x
        const y = py + DIRECTION_OFFSETS[exit].y
        if (
          x < 0 ||
          x >= ROOMS_SIZE ||
          y < 0 ||
          y >= ROOMS_SIZE ||
          roomNames[y * ROOMS_SIZE + x] ||
          !pred(roomName, prev, distance)
        )
          continue

        roomNames[y * ROOMS_SIZE + x] = roomName
        nq.push({ roomName, x, y })
      }
    }
    q = nq
  }
  return roomNames
}

function* iterRemotesNames(roomNames: Readonly<RemotesNamesMatrix>) {
  for (let y = 0; y < ROOMS_SIZE; ++y) {
    for (let x = 0; x < ROOMS_SIZE; ++x) {
      const roomName = roomNames[y * ROOMS_SIZE + x]
      if (roomName) yield { roomName, x, y }
    }
  }
}
function* forInRemoteRoom(p: Coordinates) {
  const rty = p.y * ROOM_SIZE_IN
  const rtx = p.x * ROOM_SIZE_IN
  for (let y = 0; y < ROOM_SIZE_IN; ++y) {
    const ty = (rty + y) * SIZE
    for (let x = 0; x < ROOM_SIZE_IN; ++x) {
      yield { x, y, i: ty + rtx + x }
    }
  }
}
function getRemotesMatrixIndex(p: RoomPosition, roomNames: Readonly<RemotesNamesMatrix>) {
  const rIdx = roomNames.indexOf(p.roomName as RoomName)
  if (rIdx < 0) return -1
  const ry = (rIdx / ROOMS_SIZE) | 0
  const rx = rIdx % ROOMS_SIZE
  return (ry * ROOM_SIZE_IN + p.y) * SIZE + rx * ROOM_SIZE_IN + p.x
}

/**
 * Create a 4 rooms radius grid of terrain matrix
 * @param roomNames 4 rooms radius grid of names. Can be created with {@link makeNeighborRemotesNamesMatrix}. Undefined rooms are blocked.
 * @param block A function to block specific coordinates in a room
 * @returns A 4 rooms radius grid of terrain matrix
 */
export function makeRemotesTerrainMatrix(
  roomNames: Readonly<RemotesNamesMatrix>,
  block: (name: RoomName) => Iterable<Coordinates> = () => []
) {
  const cm = new Uint8Array(SIZE * SIZE).fill(MATRIX_MAX) as RemotesCostMatrix
  const TERRAIN_COST = [1, 255, 5] as const
  for (const { roomName, x: rx, y: ry } of iterRemotesNames(roomNames)) {
    const t = Game.map.getRoomTerrain(roomName)
    const rty = ry * ROOM_SIZE_IN
    const rtx = rx * ROOM_SIZE_IN
    for (let y = 0; y < ROOM_SIZE_IN; ++y) {
      const ty = (rty + y) * SIZE
      for (let x = 0; x < ROOM_SIZE_IN; ++x) {
        cm[ty + rtx + x] = TERRAIN_COST[t.get(x, y)]
      }
    }
    for (const { x, y } of block(roomName)) cm[(rty + y) * SIZE + rtx + x] = 255
  }
  return cm
}

/**
 * Display each cell of a 4 rooms radius grid of matrix with a {@link RoomVisual}.
 * @param roomNames a 4 rooms radius grid of names. Can be created with {@link makeNeighborRemotesNamesMatrix}
 * @param cm a 4 rooms radius grid of matrix. Can be created with {@link makeRemotesTerrainMatrix} or {@link makeRemotesDistanceMatrix}
 * @param ignore value to ignore
 * @param style style options for the visual representation
 * @param getVisual a function to get a {@link RoomVisual} for a room
 */
export function visualizeRemotesCostMatrix(
  roomNames: Readonly<RemotesNamesMatrix>,
  cm: Readonly<RemotesCostMatrix>,
  ignore = 255,
  style: TextStyle = { opacity: 0.5, font: 0.5 },
  getVisual = (name: RoomName) => new RoomVisual(name) as RoomVisual | undefined
) {
  for (const r of iterRemotesNames(roomNames)) {
    const visual = getVisual(r.roomName)
    if (!visual) continue

    for (const { x, y, i } of forInRemoteRoom(r)) {
      if (cm[i] != ignore) visual.text(cm[i].toString(), x, y, style)
    }
  }
}

/**
 * Create a 4 rooms radius grid of distance matrix from a starting position.
 * NOTE: Terrain values between 2 and 254 are considered as swamp.
 * @param from Starting position or an array of starting positions
 * @param roomNames 4 rooms radius grid of names. Can be created with {@link makeNeighborRemotesNamesMatrix}
 * @param terrain 4 rooms radius grid of terrain matrix. Can be created with {@link makeRemotesTerrainMatrix}
 * @param limit Maximum distance to calculate
 * @returns A 4 rooms radius grid of distance matrix
 */
export function makeRemotesDistanceMatrix(
  from: RoomPosition | RoomPosition[],
  roomNames: Readonly<RemotesNamesMatrix>,
  terrain: Readonly<RemotesCostMatrix>,
  limit = MATRIX_MAX - 1
): RemotesCostMatrix {
  if (!Array.isArray(from)) from = [from]

  const dm = new Uint8Array(SIZE * SIZE).fill(MATRIX_MAX) as RemotesCostMatrix

  const SWAMP_RATIO = CONSTRUCTION_COST_ROAD_SWAMP_RATIO
  const queues = new Array(SWAMP_RATIO + 1).fill(0).map(() => new Array<number>())
  queues[0] = from.map((p) => getRemotesMatrixIndex(p, roomNames))

  const limit_ = Math.min(limit, MATRIX_MAX - 1)
  for (let dist = 0; dist < limit_ && queues.some((q) => q.length > 0); dist++) {
    const open = queues[0]
    const next = queues[1]
    const swamp = queues[SWAMP_RATIO]

    for (const idx of open) {
      const y = (idx / SIZE) | 0
      const x = idx % SIZE
      for (const { x: dx, y: dy } of DIRECTION_OFFSETS_LIST) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue

        const i = ny * SIZE + nx
        const t = terrain[i]
        const cv = dm[i]
        const is_swamp = t == SWAMP_RATIO
        const nv = dist + (is_swamp ? SWAMP_RATIO : 1)
        if (t == MATRIX_MAX || nv >= cv) continue

        dm[i] = nv
        if (is_swamp) {
          swamp.push(i)
        } else {
          next.push(i)
        }
      }
    }

    for (let i = 0; i < SWAMP_RATIO; ++i) {
      queues[i] = queues[i + 1]
    }
    open.length = 0
    queues[SWAMP_RATIO] = open
  }
  for (const p of from) dm[getRemotesMatrixIndex(p, roomNames)] = 0
  return dm
}

/**
 * Get the distance value from a distance matrix at a specific position.
 * @param pos Room position
 * @param roomNames 4 rooms radius grid of names. Can be created with {@link makeNeighborRemotesNamesMatrix}
 * @param dm 4 rooms radius grid of distance matrix. Can be created with {@link makeRemotesDistanceMatrix}
 * @returns Distance value at the position
 */
export function getRemotesDistanceMatrixValue(
  pos: RoomPosition,
  roomNames: Readonly<RemotesNamesMatrix>,
  dm: Readonly<RemotesCostMatrix>
) {
  const rIdx = roomNames.indexOf(pos.roomName as RoomName)
  if (rIdx < 0) return MATRIX_MAX

  const y = ((rIdx / ROOMS_SIZE) | 0) * ROOM_SIZE_IN + pos.y
  const x = (rIdx % ROOMS_SIZE) * ROOM_SIZE_IN + pos.x
  const idx = y * SIZE + x
  let v = dm[idx]
  if (v !== MATRIX_MAX) return v

  for (const { x: dx, y: dy } of DIRECTION_OFFSETS_LIST) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue
    v = Math.min(v, dm[ny * SIZE + nx])
  }
  return Math.min(v + 1, MATRIX_MAX)
}

/**
 * Create a shortest paths tree from a center to multiple targets.
 * FIXME: would need a real pathfinder to avoid branching fails.
 * @param center starting position
 * @param targets target positions
 * @param roomNames 4 rooms radius grid of names. Can be created with {@link makeNeighborRemotesNamesMatrix}
 * @param limit maximum distance from the center
 * @param terrain an optional 4 rooms radius grid of terrain matrix. Can be created with {@link makeRemotesTerrainMatrix}
 * @param dm an optional 4 rooms radius grid of distance matrix. Can be created with {@link makeRemotesDistanceMatrix}
 * @returns An object containing reachable goals with paths as well as the terrain and distance matrices
 */
export function makeRemotesShortestPathsTree(
  center: RoomPosition,
  targets: RoomPosition[],
  roomNames: Readonly<RemotesNamesMatrix>,
  limit?: number,
  terrain?: Readonly<RemotesCostMatrix>,
  dm?: Readonly<RemotesCostMatrix>
) {
  const terrain_ = terrain ?? makeRemotesTerrainMatrix(roomNames)
  const dm_ = dm ?? makeRemotesDistanceMatrix(center, roomNames, terrain_, limit)

  const goals = targets
    .map((p) => ({ pos: p, dist: getRemotesDistanceMatrixValue(p, roomNames, dm_) }))
    .filter(({ dist }) => dist < MATRIX_MAX)
    .map(({ pos, dist }) => ({
      pos,
      dist,
      dm: makeRemotesDistanceMatrix(pos, roomNames, terrain_, dist),
    }))

  const reuse = new Uint8Array(SIZE * SIZE).fill(0) as RemotesCostMatrix
  for (let y = 0; y < SIZE; ++y) {
    for (let x = 0; x < SIZE; ++x) {
      const idx = y * SIZE + x
      const t = terrain_[idx] - dm_[idx] - 1
      let v = 0
      for (const { dm: to, dist } of goals) {
        if (to[idx] == t + dist) v += 1
      }
      reuse[idx] = v
    }
  }

  const paths = goals.map(({ pos, dm, dist }) => {
    const goalIdx = getRemotesMatrixIndex(pos, roomNames)
    const path: RoomPosition[] = []
    const ty = (goalIdx / SIZE) | 0
    const tx = goalIdx % SIZE
    let x = ROOMS_RADIUS * ROOM_SIZE_IN + center.x
    let y = ROOMS_RADIUS * ROOM_SIZE_IN + center.y
    while (x != tx || y != ty) {
      const cx = x
      const cy = y
      const cidx = cy * SIZE + cx
      //we know path only goes through reachable rooms
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const roomName = roomNames[(((cy / ROOM_SIZE_IN) | 0) * ROOMS_SIZE + cx / ROOM_SIZE_IN) | 0]!
      path.push(new RoomPosition(cx % ROOM_SIZE_IN, cy % ROOM_SIZE_IN, roomName))
      const cd = dm[cidx]
      let re = 0
      let d = cd
      let t = MATRIX_MAX
      for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
          if (dx === 0 && dy === 0) continue
          const nx = cx + dx
          const ny = cy + dy
          if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue

          const nidx = ny * SIZE + nx
          const nd = dm[nidx]
          if (nd >= cd) continue

          const nre = reuse[nidx]
          const nt = terrain_[nidx]
          if (nre > re || (nre == re && nd < d) || (nre == re && nd == d && nt < t)) {
            x = nx
            y = ny
            re = nre
            d = nd
            t = nt
          }
        }
      }
    }
    return { pos, path, dist, dm }
  })
  return { terrain, dm, goals: paths }
}
