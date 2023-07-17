export type Encoder<T, U> = (t: T) => U
export interface Converter<T, U> {
  encode: Encoder<T, U>
  decode: Encoder<U, T>
}
