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

/** Map creep actions with required range */
export const ACTION_RANGE: Record<ActionConstant, number | undefined> = {
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
