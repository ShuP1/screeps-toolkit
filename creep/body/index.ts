import { ACTION_BODYPART, ActionConstant } from "../constants"

/**
 * Count the number of bodyparts of a given type
 * @param body Array of bodyparts {@link Creep.body}
 * @param type Expected type
 * @param active Count only active bodyparts
 * @returns Number of bodyparts
 */
export function getBodyparts(
  body: readonly BodyPartDefinition[],
  type: BodyPartConstant,
  active = false
) {
  let count = 0
  for (let i = body.length; i-- > 0; ) {
    if (active && body[i].hits <= 0) break
    if (body[i].type == type) count += 1
  }
  return count
}
/**
 * Count the number of active bodyparts of a given type
 * @param body Array of bodyparts {@link Creep.body}
 * @param type Expected type
 * @returns Number of active bodyparts
 */
export const getActiveBodyparts = (body: readonly BodyPartDefinition[], type: BodyPartConstant) =>
  getBodyparts(body, type, true)

/**
 * Compute the number of bodyparts of a given action taking boosts into account
 * @param body Array of bodyparts {@link Creep.body}
 * @param action Expected boosts to use
 * @param active Count only active bodyparts
 * @returns An equivalent number of unboosted bodyparts
 */
export function getBodypartsBoostEquivalent(
  body: readonly BodyPartDefinition[],
  action: ActionConstant,
  active = false
) {
  const type = ACTION_BODYPART[action]
  let total = 0
  for (let i = body.length; i-- > 0; ) {
    const x = body[i]
    if (active && x.hits <= 0) {
      break
    }
    if (x.type == type) {
      if (x.boost !== undefined) {
        const boost = (BOOSTS[type] as BoostsBodypartType)[x.boost][action]
        total += boost > 1 ? boost : 2 - boost
      } else {
        total += 1
      }
    }
  }
  return total
}
/**
 * Compute the number of active bodyparts of a given action taking boosts into account
 * @param body Array of bodyparts {@link Creep.body}
 * @param action Expected boosts to use
 * @returns An equivalent number of active unboosted bodyparts
 */
export const getActiveBodypartsBoostEquivalent = (
  body: readonly BodyPartDefinition[],
  action: ActionConstant
) => getBodypartsBoostEquivalent(body, action)

type BoostsBodypartType = Record<string, Record<ActionConstant, number>>
