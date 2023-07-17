/** Clear Memory.creeps out of missing {@link Creep} */
export function deleteDeadCreepsMemory() {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete Memory.creeps[name]
    }
  }
}
