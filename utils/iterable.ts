/**
 * Compute the sum of a list of things.
 * ```ts
 * ts.reduce((acc, t) => acc + map(t), 0)
 * ```
 * But also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to number
 * @returns the total sum
 */
export function sum<T>(ts: Iterable<T>, map: (t: T) => number): number {
  let v = 0
  for (const t of ts) v += map(t)
  return v
}
/**
 * Compute the average of a list of things.
 * ```ts
 * ts.reduce((acc, t) => acc + map(t), 0) / ts.length
 * ```
 * But also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to number
 * @returns the average or 0 if ts is empty
 */
export function avg<T>(ts: Iterable<T>, map: (t: T) => number): number {
  let count = 0
  let v = 0
  for (const t of ts) {
    count += 1
    v += map(t)
  }
  return count ? v / count : 0
}
/**
 * Count values of a list of things also works with generators.
 * @param ts list of things
 * @param pred optional: function to check if thing is valid
 * @returns the number of valid things
 */
export function count<T>(ts: Iterable<T>, pred: (t: T) => boolean = exists): number {
  return sum(ts, (t) => (pred(t) ? 1 : 0))
}
/**
 * Check the value is not undefined
 * @param t value to check
 * @returns is not undefined
 */
export function exists<T>(t: T | undefined): t is T {
  return t !== undefined
}

/**
 * Find the thing of a list with the biggest value also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to number
 * @param minE optional: exclusive minimum value to accept
 * @returns the thing will the biggest value or undefined if none are superior to {@link minE}
 */
export function max<T>(
  ts: Iterable<T>,
  map: (t: T) => number,
  minE: number = Number.NEGATIVE_INFINITY
): T | undefined {
  let res = undefined
  for (const t of ts) {
    const v = map(t)
    if (v > minE) {
      minE = v
      res = t
    }
  }
  return res
}
/**
 * Find the thing of a list with the lowest value also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to number
 * @param maxE optional: exclusive maximum value to accept
 * @returns the thing will the lowest value or undefined if none are inferior to {@link maxE}
 */
export function min<T>(
  ts: Iterable<T>,
  map: (t: T) => number,
  maxE: number = Number.POSITIVE_INFINITY
): T | undefined {
  return max(ts, (t) => -map(t), -maxE)
}

/**
 * Calls a defined callback function on each element of a list.
 * ```ts
 * ts.map(map)
 * ```
 * But also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to something
 * @yields each mapped thing
 */
export function* map<T, U>(ts: Iterable<T>, map: (t: T) => U): IterableIterator<U> {
  for (const t of ts) {
    yield map(t)
  }
}
/**
 * Calls a defined callback function on each element of a list.
 * ```ts
 * ts.forEach(map)
 * ```
 * But also works with generators.
 * @param ts list of things
 * @param act function to do something with a thing
 */
export function forEach<T>(ts: Iterable<T>, act: (t: T) => void) {
  for (const t of ts) act(t)
}
/**
 * Returns individual elements of each sub-array also works with generators.
 * @param tts nested list of things
 * @yields each individual thing
 */
export function* flatten<T>(...tts: Iterable<T>[]) {
  for (const ts of tts) yield* ts
}
/**
 * Calls a defined callback function on each element of a list then returns individual elements also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to a list of something else
 * @yields each individual mapped thing
 */
export function* flatMap<T, U>(ts: Iterable<T>, map: (t: T) => Iterable<U>) {
  for (const t of ts) yield* map(t)
}
/** Empty generator */
export function* none<T>(): Generator<T> {
  /* */
}

/**
 * Returns the elements of an array that meet the condition specified in a callback function.
 * ```ts
 * ts.filter(pred)
 * ```
 * But also works with generators.
 * @param ts list of things
 * @param pred function to check if thing is valid
 * @yields each valid thing
 */
export function* filter<T>(ts: Iterable<T>, pred: (t: T) => boolean): IterableIterator<T> {
  for (const t of ts) {
    if (pred(t)) yield t
  }
}
/**
 * Returns the elements of an array that meet the condition specified in a callback function.
 * ```ts
 * ts.filter(pred)
 * ```
 * But also works with generators.
 * @param ts list of things
 * @param pred function to check if thing is valid
 * @yields each valid thing
 */
export function* filterIs<T, U extends T>(
  ts: Iterable<T>,
  pred: (t: T) => t is U
): IterableIterator<U> {
  for (const t of ts) {
    if (pred(t)) yield t
  }
}

/**
 * Returns the first thing which is valid.
 * @param ts list of things
 * @param pred function to check if a thing is valid
 * @returns a thing or undefined if none are valid
 */
export function first<T>(ts: Iterable<T>, pred: (t: T) => boolean): T | undefined {
  for (const t of ts) {
    if (pred(t)) return t
  }
  return undefined
}
/**
 * Returns the first thing which is valid.
 * @param ts list of things
 * @param pred function to check if a thing is valid
 * @returns a thing or undefined if none are valid
 */
export function firstIs<T, U extends T>(ts: Iterable<T>, pred: (t: T) => t is U): U | undefined {
  for (const t of ts) {
    if (pred(t)) return t
  }
  return undefined
}

export const collect = Array.from

/**
 * Filter an array without allocating a new one.
 * @param ts an array of things
 * @param pred function to check if a thing is valid
 * @returns same array with only valid things
 */
export function filterInPlace<T>(ts: T[], pred: (t: T) => boolean) {
  let j = 0
  ts.forEach((e, i) => {
    if (pred(e)) {
      if (i !== j) ts[j] = e
      j++
    }
  })
  ts.length = j
  return ts
}

/**
 * Select a random element in an array with uniform distribution.
 * @param ts an array of elements
 * @returns an element or undefined if array is empty
 */
export function randomPick<T>(ts: readonly T[]): T | undefined {
  return ts.length ? ts[Math.floor(Math.random() * ts.length)] : undefined
}
/**
 * Select a random element in an array with a custom distribution.
 * @param ts an array of elements
 * @param weight function returning the relative probability of each element
 * @returns an element or undefined if array is empty
 */
export function weightedRandomPick<T>(ts: readonly T[], weight: (t: T) => number): T | undefined {
  let w = Math.random() * sum(ts, weight)
  for (const t of ts) {
    w -= weight(t)
    if (w < 0) return t
  }
  return undefined
}

/**
 * Sorts an array in place by score ascending.
 * @param ts an array of things
 * @param score function to convert a thing to it's score
 * @returns the sorted array
 */
export function sort<T>(ts: T[], score: (t: T) => number): T[] {
  return ts.sort((a, b) => score(a) - score(b))
}
/**
 * Function wrap for map like with cached previous results.
 * @example sort(ts, cached(t => "heavy compute..."))
 * @param f function to wrap
 * @returns wrapped function
 */
export function cached<T, U>(f: (t: T) => U) {
  const cache = new Map<T, U>()
  return (t: T) => {
    if (!cache.has(t)) cache.set(t, f(t))
    return cache.get(t) as U
  }
}
