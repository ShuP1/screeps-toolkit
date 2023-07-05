/** Is game running in single room simulation */
export const IS_SIM = !!Game.rooms["sim"]
/** Is game running on the official server */
export const IS_MMO = !!Game.shard?.name?.startsWith("shard")

/** An array of all minerals */
export const MINERALS_ALL = Object.keys(MINERAL_MIN_AMOUNT) as MineralConstant[]
/** An array of all lab's mineral compounds */
export const COMPOUNDS_ALL = Object.keys(REACTION_TIME) as MineralCompoundConstant[]
