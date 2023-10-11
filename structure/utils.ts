import { sum } from "../utils/iterable"

/**
 * Typed check for {@link Structure.structureType}
 * @param s ths structure to check
 * @param type structure type constant
 * @returns whether this structure is of type
 */
export function isStructureType<T extends keyof ConcreteStructureMap>(
  s: Structure,
  type: T
): s is ConcreteStructureMap[T] {
  return s.structureType == type
}

/**
 * Typed filter for {@link Room.find}
 * @example room.find(FIND_STRUCTURES, { filter: filterStructureType(STRUCTURE_CONTAINER) })
 * @param type structure type constant
 * @returns filter object
 */
export function filterStructureType<T extends keyof ConcreteStructureMap>(type: T) {
  return ((s) => isStructureType(s, type)) as (s: Structure) => s is ConcreteStructureMap[T]
}

export class StructuresByType implements Iterable<[StructureConstant, readonly AnyStructure[]]> {
  private map = new Map<StructureConstant, AnyStructure[]>()
  readonly length: number

  constructor(sts: AnyStructure[]) {
    this.length = sts.length
    for (const s of sts) {
      const exists = this.map.get(s.structureType)
      if (exists) {
        exists.push(s)
      } else {
        this.map.set(s.structureType, [s])
      }
    }
  }
  [Symbol.iterator](): IterableIterator<[StructureConstant, AnyStructure[]]> {
    return this.map.entries()
  }
  get<T extends StructureConstant>(type: T): ConcreteStructureMap[T][] {
    return (this.map.get(type) as ConcreteStructureMap[T][] | undefined) ?? []
  }
}

/**
 * Compute a level comparable with {@link StructureController} level evaluating built structures.
 * @param sbt storage of all structures by type
 * @param requiredStructures structure types needed for a level to be complete
 * @returns an object like {@link GlobalControlLevel}
 */
export function getStructuralLevel(
  sbt: StructuresByType,
  requiredStructures = defaultRequiredStructures
) {
  const maxLevel = 8
  for (let l = 1; l <= maxLevel; l++) {
    if (
      !requiredStructures.every((type) => sbt.get(type).length >= CONTROLLER_STRUCTURES[type][l])
    ) {
      const progress = sum(
        requiredStructures,
        (type) => sbt.get(type).length * CONSTRUCTION_COST[type]
      )
      const progressTotal = sum(
        requiredStructures,
        (type) => (CONTROLLER_STRUCTURES[type][l] || 0) * CONSTRUCTION_COST[type]
      )
      return { level: l - 1, progress, progressTotal }
    }
  }
  return { level: maxLevel, progress: 0, progressTotal: 0 }
}
const defaultRequiredStructures: readonly BuildableStructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION,
  STRUCTURE_STORAGE,
  STRUCTURE_TOWER,
  STRUCTURE_POWER_SPAWN,
  STRUCTURE_OBSERVER,
  STRUCTURE_TERMINAL,
  STRUCTURE_LAB,
  STRUCTURE_NUKER,
  STRUCTURE_FACTORY,
]

/**
 * Compute ticks until a {@link StructureRoad} is destroyed by time decay.
 * @param road the road to check
 * @returns ticks until decay
 */
export function getRoadTicksToDestroy(road: StructureRoad) {
  const { ticksToDecay, hits, hitsMax } = road
  const decayCycles = Math.floor(hits / (hitsMax * (ROAD_HITS / ROAD_DECAY_AMOUNT)))
  return decayCycles * ROAD_DECAY_TIME + ticksToDecay
}
