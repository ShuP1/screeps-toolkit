interface WithProgress {
  level: number
  progress: number
  progressTotal: number
}

/**
 * Compute total global control progress {@link Game.gcl} ignoring levels.
 * @returns total global control progress
 */
export const getGclCumulatedProgress = () =>
  getGxlCumulatedProgress(Game.gcl, GCL_POW, GCL_MULTIPLY)
/**
 * Compute total global power progress {@link Game.gpl} ignoring levels.
 * @returns total global power progress
 */
export const getGplCumulatedProgress = () =>
  getGxlCumulatedProgress(Game.gpl, POWER_LEVEL_POW, POWER_LEVEL_MULTIPLY)

function getGxlCumulatedProgress({ level, progress }: WithProgress, pow: number, multiply: number) {
  return Math.pow(level - 1, pow) * multiply + progress
}

/**
 * Compute total {@link StructureController} progress ignoring levels.
 * @param ctrl target controller
 * @returns controller total progress
 */
export function getControllerCumulatedProgress(ctrl: StructureController) {
  let progress = ctrl.progress
  for (let i = 1; i < ctrl.level; i++) progress += CONTROLLER_LEVELS[i]
  return progress
}

/**
 * Compute level of {@link StructureContainer}, Game.gcl or Game.gpl with added progress ratio.
 * @param it target thing with progress
 * @returns level with 2 decimal for progress
 */
export function getLevelWithProgress(it: WithProgress) {
  const { level, progress, progressTotal } = it
  return level + Math.round(Math.min(0.99, progress / progressTotal) * 100) / 100
}
