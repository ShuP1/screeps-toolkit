/**
 * Compute tower effectiveness at a given range.
 * @param dist range between the tower and target
 * @returns Tower power ratio (between 0 and 1)
 */
export function getTowerRangeRatio(dist: number) {
  if (dist >= TOWER_FALLOFF_RANGE) return 1 - TOWER_FALLOFF
  const towerFalloffPerTile = TOWER_FALLOFF / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
  return 1 - Math.max(0, dist - TOWER_OPTIMAL_RANGE) * towerFalloffPerTile
}
