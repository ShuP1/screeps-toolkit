/** Is game running in single room simulation */
export const IS_SIM = !!Game.rooms.sim as boolean
/** Is game running on the official server */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const IS_MMO = !!Game.shard?.name?.startsWith("shard")

/** The name of the account running the code  */
export const PLAYER_USERNAME = (
  Object.values(Game.spawns)[0] ||
  Object.values(Game.rooms).find((r) => r.controller?.my)?.controller ||
  Object.values(Game.creeps)[0]
).owner.username
/** username for the Invader NPCs */
export const INVADER_USERNAME = "Invader"
/** username for Source Keeper NPCs */
export const SOURCE_KEEPER_USERNAME = "Source Keeper"
/** username for the Caravan NPCs & unclaimed ruins */
export const CARAVAN_USERNAME = "Screeps"

/** An array of all minerals */
export const MINERALS_ALL = Object.keys(MINERAL_MIN_AMOUNT) as MineralConstant[]
/** An array of all lab's mineral compounds */
export const COMPOUNDS_ALL = Object.keys(REACTION_TIME) as MineralCompoundConstant[]

/** A map of {@link ScreepsReturnCode} to their string names */
export const RETURN_CODES: Record<ScreepsReturnCode, string> = {
  [OK]: "Ok",
  [ERR_NOT_OWNER]: "Error: Not owner",
  [ERR_NO_PATH]: "Error: No path",
  [ERR_BUSY]: "Error: Busy",
  [ERR_NAME_EXISTS]: "Error: Name exists",
  [ERR_NOT_FOUND]: "Error: Not found",
  [ERR_NOT_ENOUGH_RESOURCES]: "Error: Not enough resources",
  [ERR_INVALID_TARGET]: "Error: Invalid target",
  [ERR_FULL]: "Error: Full",
  [ERR_NOT_IN_RANGE]: "Error: Not in range",
  [ERR_INVALID_ARGS]: "Error: Invalid args",
  [ERR_TIRED]: "Error: Tired",
  [ERR_NO_BODYPART]: "Error: No bodypart",
  [ERR_RCL_NOT_ENOUGH]: "Error: Not enough RCL",
  [ERR_GCL_NOT_ENOUGH]: "Error: Not enough GCL",
}
