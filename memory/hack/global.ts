class MemHack {
  memory: Memory

  constructor() {
    this.memory = Memory
    this.memory = (RawMemory as unknown as { _parsed: Memory })._parsed
  }

  run() {
    const g = global as Partial<{ Memory: Memory }>
    delete g.Memory
    g.Memory = (RawMemory as { _parsed?: Memory })._parsed = this.memory
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
