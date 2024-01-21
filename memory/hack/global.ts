class MemHack {
  private memory?: Memory
  private lastTick = -1
  private parseCpu = 0

  constructor() {
    this.run()
  }

  /**
   * Try to reuse memory from the last tick
   * @returns CPU used for parsing memory
   */
  run() {
    if (Game.time === this.lastTick) return this.parseCpu

    if (this.memory && this.lastTick + 1 === Game.time) {
      // Reuse previous memory
      const g = global as Partial<{ Memory: Memory }>
      delete g.Memory
      g.Memory = (RawMemory as { _parsed?: Memory })._parsed = this.memory
      this.parseCpu = 0
    } else {
      // Parse memory
      const before = Game.cpu.getUsed()
      this.memory = Memory
      this.parseCpu = Game.cpu.getUsed() - before
      this.memory = (RawMemory as unknown as { _parsed: Memory })._parsed
    }
    this.lastTick = Game.time
    return this.parseCpu
  }
}

/**
 * Ripped from https://github.com/AlinaNova21/ZeSwarm/
 * Organized by Carson Burke and xTwisteDx
 *
 * Usage:
 * Before the loop, import memHack
 * At start of loop(), run memHack.run()
 */
export const memHack = new MemHack()
