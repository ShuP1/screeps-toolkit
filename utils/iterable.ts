import { getOrSetMap } from "./map"

/**
 * Calls the specified callback function for all the elements in a list.
 * The return value of the callback function is the accumulated result,
 * and is provided as an argument in the next call to the callback function.
 * `ts.reduce` But also works with generators.
 * @param ts list of things
 * @param acc function to accumulate a thing to
 * @param initial accumulator start value
 * @returns the accumulated total
 */
export function reduce<T, U = T>(ts: Iterable<T>, acc: (acc: U, t: T) => U, initial: U) {
  let v = initial
  for (const t of ts) v = acc(v, t)
  return v
}
/** Data-last version of {@link reduce} */
export const reduce_ = partial(reduce)

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
/** Data-last version of {@link sum} */
export const sum_ = partial1(sum)

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
/** Data-last version of {@link avg} */
export const avg_ = partial1(avg)

/**
 * Count values of a list of things also works with generators.
 * @param ts list of things
 * @param pred optional: function to check if thing is valid
 * @returns the number of valid things
 */
export function count<T>(ts: Iterable<T>, pred: (t: T) => boolean = exists): number {
  return sum(ts, (t) => (pred(t) ? 1 : 0))
}
/** Data-last version of {@link count} */
export const count_ = partial1(count)

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
/** Data-last version of {@link max} */
export const max_ = partial(max)

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
/** Data-last version of {@link min} */
export const min_ = partial(min)

/**
 * Find the biggest value in a list of things also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to number
 * @param minE optional: exclusive minimum value to accept
 * @returns the biggest value and the associated thing or undefined if none are superior to {@link minE}
 */
export function maxEntry<T>(
  ts: Iterable<T>,
  map: (t: T) => number,
  minE: number = Number.NEGATIVE_INFINITY
): { t: T; value: number } | undefined {
  let res = undefined
  for (const t of ts) {
    const v = map(t)
    if (v > minE) {
      minE = v
      res = t
    }
  }
  return res ? { t: res, value: minE } : undefined
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
/** Data-last version of {@link map} */
export const map_ = partial1(map)

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
/** Data-last version of {@link forEach} */
export const forEach_ = partial1(forEach)

/**
 * Returns individual elements of each sub-array also works with generators.
 * @param tts nested list of things
 * @yields each individual thing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function* flatten<ITs extends Iterable<any>[]>(
  ...tts: ITs
): Generator<UnionI<ITs>, void, undefined> {
  for (const ts of tts) yield* ts as Iterable<UnionI<ITs>>
}
type UnionI<ITs> = ITs extends [Iterable<infer T>, ...infer UTs]
  ? T | UnionI<UTs>
  : ITs extends [Iterable<infer T>]
  ? T
  : never

/**
 * Calls a defined callback function on each element of a list then returns individual elements also works with generators.
 * @param ts list of things
 * @param map function to convert a thing to a list of something else
 * @yields each individual mapped thing
 */
export function* flatMap<T, U>(ts: Iterable<T>, map: (t: T) => Iterable<U>) {
  for (const t of ts) yield* map(t)
}
/** Data-last version of {@link flatMap} */
export const flatMap_ = partial1(flatMap)

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
/** Data-last version of {@link filter} */
export const filter_ = partial1(filter)

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
/** Data-last version of {@link filterIs} */
export const filterIs_ = partial1(filterIs)

/**
 * Returns the first thing which is valid.
 * @param ts list of things
 * @param pred function to check if a thing is valid
 * @returns a thing or undefined if none are valid
 */
export function first<T>(ts: Iterable<T>, pred: (t: T) => boolean = exists): T | undefined {
  for (const t of ts) {
    if (pred(t)) return t
  }
  return undefined
}
/** Data-last version of {@link first} */
export const first_ = partial1(first)

/**
 * Returns if any of the thing is valid.
 * @param ts list of things
 * @param pred function to check if a thing is valid
 * @returns if any is valid
 */
export function some<T>(ts: Iterable<T>, pred: (t: T) => boolean = exists): boolean {
  for (const t of ts) {
    if (pred(t)) return true
  }
  return false
}
/**
 * Returns if all the things are valid.
 * @param ts list of things
 * @param pred function to check if a thing is valid
 * @returns if all are valid
 */
export function every<T>(ts: Iterable<T>, pred: (t: T) => boolean = exists): boolean {
  for (const t of ts) {
    if (!pred(t)) return false
  }
  return true
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
/** Data-last version of {@link firstIs} */
export const firstIs_ = partial1(firstIs)

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
/** Data-last version of {@link filterInPlace} */
export const filterInPlace_ = partial1(filterInPlace)

/**
 * Create a map aka dictionary from a list.
 * @param ts list of things
 * @param key function to get the key from a thing
 * @returns a map of keys and arrays of values
 */
export function groupBy<T, K>(ts: Iterable<T>, key: (t: T) => K) {
  const map = new Map<K, T[]>()
  for (const t of ts) {
    getOrSetMap(map, key(t), () => []).push(t)
  }
  return map
}
/** Data-last version of {@link groupBy} */
export const groupBy_ = partial1(groupBy)

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
/** Data-last version of {@link weightedRandomPick} */
export const weightedRandomPick_ = partial1(weightedRandomPick)

/**
 * Sorts an array in place by score ascending.
 * @param ts an array of things
 * @param score function to convert a thing to it's score
 * @returns the sorted array
 */
export function sort<T>(ts: T[], score: (t: T) => number): T[] {
  return ts.sort((a, b) => score(a) - score(b))
}
/** Data-last version of {@link sort} */
export const sort_ = partial1(sort)

export function pipe<A, B>(v: A, f1: (v: A) => B): B
export function pipe<A, B, C>(v: A, f1: (v: A) => B, f2: (v: B) => C): C
export function pipe<A, B, C, D>(v: A, f1: (v: A) => B, f2: (v: B) => C, f3: (v: C) => D): D
export function pipe<A, B, C, D, E>(
  v: A,
  f1: (v: A) => B,
  f2: (v: B) => C,
  f3: (v: C) => D,
  f4: (v: D) => E
): E
export function pipe<A, B, C, D, E, F>(
  v: A,
  f1: (v: A) => B,
  f2: (v: B) => C,
  f3: (v: C) => D,
  f4: (v: D) => E,
  f5: (v: E) => F
): F
export function pipe<A, B, C, D, E, F, G>(
  v: A,
  f1: (v: A) => B,
  f2: (v: B) => C,
  f3: (v: C) => D,
  f4: (v: D) => E,
  f5: (v: E) => F,
  f6: (v: F) => G
): G
export function pipe<A, B, C, D, E, F, G, H>(
  v: A,
  f1: (v: A) => B,
  f2: (v: B) => C,
  f3: (v: C) => D,
  f4: (v: D) => E,
  f5: (v: E) => F,
  f6: (v: F) => G,
  f7: (v: G) => H
): H
/**
 * Perform left-to-right function composition.
 * @param v The initial value.
 * @param fns the list of unary functions to apply.
 * @returns `fns.reduce((acc, fn) => fn(acc), t)` with valid types.
 * @example
 * pipe(
 *   [1, 2, 3, 4],
 *   map._(x => x * 2),
 *   arr => [arr[0] + arr[1], arr[2] + arr[3]],
 * ) // => [6, 14]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pipe<A, Fns extends ((v: any) => any)[]>(v: A, ...fns: Fns) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  return fns.reduce((acc, fn) => fn(acc), v) as Fns extends [...infer _, (t: any) => infer R]
    ? R
    : A
}

/**
 * Convert data-first function to data-last.
 * @param fn a data-first function
 * @returns a data-last function
 * @example
 * const powE = partial(Math.pow)(Math.E)
 * powE(42) === Math.pow(42, Math.E)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function partial<T, Ps extends any[], U>(fn: (t: T, ...ps: Ps) => U) {
  return (...ps: Ps) =>
    (t: T) =>
      fn(t, ...ps)
}
function partial1<T, P, U>(fn: (t: T, p: P) => U) {
  return (p: P) => (t: T) => fn(t, p)
}
