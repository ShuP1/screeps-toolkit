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
