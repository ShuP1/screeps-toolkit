import { Converter } from "./type"

export const jsonConverter: Converter<any, string> = {
  encode: JSON.stringify,
  decode: JSON.parse,
}
