/**
 * Convert a number to string in SI decimal notation.
 * @param num number to format
 * @param digits number of digits after the decimal point
 * @returns formatted string
 * @example 123k or 12.34G
 */
export function formatSI(num: number, digits = 2) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol
}

/**
 * Generate a pseudorandom number between {@link min} min inclusive and {@link max} exclusive.
 * @param min inclusive minimum
 * @param max exclusive maximum
 * @param floor round to int
 * @returns a pseudorandom number
 */
export function random(min: number, max: number, floor?: boolean) {
  const v = Math.random() * (max - min) + min
  return floor ? Math.floor(v) : v
}
