import { isStructureType } from "../structure/utils"

/** The set of {@link OBSTACLE_OBJECT_TYPES} */
export const OBSTACLE_TYPES = new Set<string>(OBSTACLE_OBJECT_TYPES)
OBSTACLE_TYPES.add("portal")

/** The set of destructible {@link OBSTACLE_OBJECT_TYPES} */
export const OBSTACLE_TYPES_DESTRUCTIBLE = new Set<StructureConstant>([
  "constructedWall",
  "spawn",
  "extension",
  "link",
  "storage",
  "observer",
  "tower",
  "powerBank",
  "powerSpawn",
  "lab",
  "terminal",
])

/** The set of non-destructible {@link OBSTACLE_OBJECT_TYPES} */
export const OBSTACLE_TYPES_NO_DESTRUCTIBLE = new Set(OBSTACLE_TYPES)
for (const t of OBSTACLE_TYPES_DESTRUCTIBLE) OBSTACLE_TYPES_NO_DESTRUCTIBLE.delete(t)

/**
 * Check is a structure is an obstacle (not walkable).
 * @param s target structure
 * @param allowPublicRampart ignore public rampart
 * @param allowDestructible ignore destructible structures
 * @returns is an obstacle
 */
export function isObjectObstacle(
  s: Structure,
  allowPublicRampart = false,
  allowDestructible = false
) {
  if (allowDestructible) return OBSTACLE_TYPES_NO_DESTRUCTIBLE.has(s.structureType)
  return (
    OBSTACLE_TYPES.has(s.structureType) ||
    (isStructureType(s, STRUCTURE_RAMPART) && !s.my && (!s.isPublic || !allowPublicRampart))
  )
}
