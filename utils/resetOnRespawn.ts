/**
 * Gather fact indicating if your bot respawned.
 * @author semperrabbit 20180331
 * @returns has just respawned
 */
export function hasRespawned() {
  // server reset or sim
  if (Game.time === 0) {
    return true
  }

  // check for 0 creeps
  if (Object.keys(Game.creeps).length > 0) {
    return false
  }

  // check for only 1 room
  const rNames = Object.keys(Game.rooms)
  if (rNames.length !== 1) {
    return false
  }

  // check for controller, progress and safe mode
  const room = Game.rooms[rNames[0]]
  if (
    !room.controller?.my ||
    room.controller.level !== 1 ||
    room.controller.progress ||
    room.controller.safeMode == undefined ||
    room.controller.safeMode <= SAFE_MODE_DURATION - 1
  ) {
    return false
  }

  // check for 1 spawn
  if (Object.keys(Game.spawns).length !== 1) {
    return false
  }

  // if all cases point to a respawn, you've respawned
  return true
}

/** Erase Memory and Flags */
export function resetGame() {
  for (const f in Game.flags) {
    Game.flags[f].remove()
  }
  ;(global as Partial<Record<string, unknown>>).Memory = {}
  RawMemory.set("{}")
  Memory.creeps = {}
  Memory.rooms = {}
  Memory.flags = {}
  Memory.spawns = {}
}

/** Wipe Memory after respawn */
export default function resetOnRespawn() {
  if (hasRespawned()) resetGame()
}
