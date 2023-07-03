export interface Encoder {
  encode(data: Uint8Array): string
  decode(encoded: string): Uint8Array
}
