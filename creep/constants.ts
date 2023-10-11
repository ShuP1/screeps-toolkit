/** Third level keys of {@link BOOSTS} constant */
export type ActionConstant =
  | "harvest"
  | "build"
  | "repair"
  | "dismantle"
  | "upgradeController"
  | "attack"
  | "rangedAttack"
  | "rangedMassAttack"
  | "heal"
  | "rangedHeal"
  | "capacity"
  | "fatigue"
  | "damage"

/** Map creep actions with requires bodypart type */
export const ACTION_BODYPART: Record<ActionConstant, BodyPartConstant> = {
  attack: "attack",
  heal: "heal",
  harvest: "work",
  build: "work",
  repair: "work",
  dismantle: "work",
  upgradeController: "work",
  rangedAttack: "ranged_attack",
  rangedMassAttack: "ranged_attack",
  rangedHeal: "heal",
  capacity: "carry",
  fatigue: "move",
  damage: "tough",
}

const ACTION_RANGE_ = {
  attack: 1,
  heal: 1,
  harvest: 1,
  dismantle: 1,
  build: 3,
  repair: 3,
  upgradeController: 3,
  rangedAttack: 3,
  rangedMassAttack: 3,
  rangedHeal: 3,
  capacity: undefined,
  fatigue: undefined,
  damage: undefined,
}
/** Map creep actions with required range */
export const ACTION_RANGE: typeof ACTION_RANGE_ & Record<ActionConstant, number | undefined> =
  ACTION_RANGE_

/** Power of RANGED_MASS_ATTACK, dependent on range */
export const RANGED_MASS_ATTACK_POWER = { 1: 10, 2: 4, 3: 1 }
/** Creep fatigue removal multiplier. Each move part remove this amount of fatigue */
export const MOVE_FATIGUE_POWER = 2
/** Creep fatigue generation multiplier. Each non-move part add this amount of fatigue depending on terrain */
export const TERRAIN_MOVE_FATIGUE = {
  road: 1,
  plain: 2,
  swamp: 10,
}

/** Additional creep hits for each bodypart */
export const HITS_PER_PART = 100
/** Additional power creep hits for each level */
export const POWER_CREEP_HITS_PER_LEVEL = 1000
