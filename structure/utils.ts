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
 * @example room.find(FIND_STRUCTURES, hasTypeFilter(STRUCTURE_CONTAINER))
 * @param type structure type constant
 * @returns filter object
 */
export function filterStructureType<T extends keyof ConcreteStructureMap>(type: T) {
  return {
    filter: ((s) => isStructureType(s, type)) as (s: Structure) => s is ConcreteStructureMap[T],
  }
}
