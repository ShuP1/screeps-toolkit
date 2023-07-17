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
