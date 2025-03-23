import { first, map } from "./iterable"

/**
 * Get a stable matching using Gale-Shapley algorithm.
 * @param applicants a map of applicants to their employers sorted by preference
 * @param employers a map of employers to their applicants sorted by preference
 * @param applicantPrefers a function that returns true if the applicant prefers the first employer over the second
 * @param employerPrefers a function that returns true if the employer prefers the first applicant over the second
 * @returns a map of employer to their matched applicants. Applicants will get the best possible match out of all the stable solutions
 */
export function getStableMatchingNoMaps<T, U>(
  applicants: Iterable<T>,
  employers: Iterable<U>,
  applicantPrefers: (self: T, prefers: U, over: U) => boolean,
  employerPrefers: (self: U, prefers: T, over: T) => boolean
) {
  const us = Array.from(employers)
  return getStableMatching(
    map<T, [T, U[]]>(applicants, (k) => [
      k,
      us.sort((a, b) => (applicantPrefers(k, a, b) ? -1 : 1)),
    ]),
    us,
    employerPrefers
  )
}

/**
 * Get a stable matching using Gale-Shapley algorithm.
 * @param applicants a map of applicants to their employers sorted by preference
 * @param employers a map of employers to their applicants sorted by preference
 * @returns a map of employer to their matched applicants. Applicants will get the best possible match out of all the stable solutions
 */
export function getStableMatchingWithMaps<T, U>(
  applicants: Iterable<[T, U[]]>,
  employers: Map<U, T[]>
) {
  return getStableMatching(applicants, employers.keys(), (self, prefers, over) => {
    const list = employers.get(self)
    return list !== undefined && list.indexOf(prefers) < list.indexOf(over)
  })
}

/**
 * Get a stable matching using Gale-Shapley algorithm.
 * @param applicants a map of applicants to their employers sorted by preference
 * @param employers a map of employers to their applicants sorted by preference
 * @param employerPrefers a function that returns true if the employer prefers the first applicant over the second
 * @returns a map of employer to their matched applicants. Applicants will get the best possible match out of all the stable solutions
 */
export function getStableMatching<T, U>(
  applicants: Iterable<[T, U[]]>,
  employers: Iterable<U>,
  employerPrefers: (self: U, prefers: T, over: T) => boolean
) {
  const ts = new Map(map<[T, U[]], [T, U[]]>(applicants, ([k, v]) => [k, v.slice()]))
  const us = Array.from(employers)
  const pending = new Set(ts.keys())

  const matches = new Map<U, T>()
  function addMatch(applicant: T, employer: U) {
    pending.delete(applicant)
    const t = ts.get(applicant)
    if (t) t.splice(t.indexOf(employer), 1)
    matches.set(employer, applicant)
  }

  for (let count = ts.size * us.length; count > 0; count--) {
    //pending is a subset of ts.keys()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const t = first(pending, (k) => ts.get(k)!.length > 0)
    if (!t) break
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const priorities = ts.get(t)!
    const u = priorities[0]

    const other = matches.get(u)
    if (!other) {
      addMatch(t, u)
    } else {
      if (employerPrefers(u, t, other)) {
        pending.add(other)
        addMatch(t, u)
      } else {
        priorities.shift()
      }
    }
  }
  return matches
}
