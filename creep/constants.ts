import { Dict } from "../utils"

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

/** Map creep actions with power multiplier */
export const ACTION_RANGE = {
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
}
/** Map creep actions with required range */
export const ACTION_RANGE_DICT: typeof ACTION_RANGE & Dict<ActionConstant, number> = ACTION_RANGE

/** Map creep actions with power multiplier */
export const ACTION_POWER = {
  attack: ATTACK_POWER,
  heal: HEAL_POWER,
  harvest: HARVEST_POWER,
  dismantle: DISMANTLE_POWER,
  build: BUILD_POWER,
  repair: REPAIR_POWER,
  upgradeController: UPGRADE_CONTROLLER_POWER,
  rangedAttack: RANGED_ATTACK_POWER,
  rangedHeal: RANGED_HEAL_POWER,
}
/** Map creep actions with power multiplier */
export const ACTION_POWER_DICT: typeof ACTION_POWER & Dict<ActionConstant, number> = ACTION_POWER

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
