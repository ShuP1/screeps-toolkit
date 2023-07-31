/** Is game running in single room simulation */
export const IS_SIM = !!Game.rooms["sim"]
/** Is game running on the official server */
export const IS_MMO = !!Game.shard?.name?.startsWith("shard")

/** The name of the account running the code  */
export const PLAYER_USERNAME = (Object.values(Game.spawns)[0] || Object.values(Game.creeps)[0])
  .owner.username
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
