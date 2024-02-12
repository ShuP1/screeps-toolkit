export * from "./type"
export * from "./utils"
export * as JSON5 from "./json5"
import * as base32768_ from "./base32768"
import { Converter } from "./type"

export const base32768: Converter<Uint8Array, string> = base32768_
