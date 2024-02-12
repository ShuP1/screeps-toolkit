class MemHack {
  private memory?: Memory
  private lastTick = -1
  private parseCpu = 0

  private skipWriteMax = 0
  private skipWriteBackoff = 1
  private nextWrite = 0
  private nextWriteInterval = 1

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
      g.Memory = this.memory
      this.parseCpu = 0
      if (this.skipWriteBackoff <= 1 || this.nextWrite-- <= 0) {
        ;(RawMemory as { _parsed?: Memory })._parsed = this.memory
        if (this.skipWriteBackoff > 1) {
          this.nextWrite = Math.min(this.nextWriteInterval, this.skipWriteMax)
          this.nextWriteInterval *= this.skipWriteBackoff
        }
      } // else: skip memory stringify at the end of this tick
    } else {
      // Parse memory
      const before = Game.cpu.getUsed()
      this.memory = Memory
      this.memory = (RawMemory as unknown as { _parsed: Memory })._parsed
      this.parseCpu = Game.cpu.getUsed() - before
      this.nextWrite = 0
      this.nextWriteInterval = 1
    }
    this.lastTick = Game.time
    return this.parseCpu
  }

  /**
   * Set the backoff and limit for skipping memory writes
   * @param limit maximum interval between writes
   * @param backoff multiplier for the next write interval
   */
  setSkipWriteRate(limit: number, backoff = 1.2) {
    this.skipWriteMax = limit
    this.skipWriteBackoff = backoff
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
