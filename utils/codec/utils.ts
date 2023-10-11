import { Converter } from "./type"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsonConverter: Converter<any, string> = {
  encode: JSON.stringify,
  decode: JSON.parse,
}
