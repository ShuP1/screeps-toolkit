/**
 * A type-safe way to define properties.
 * https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
 * @param target Object on which to add or modify properties
 * @param mixin Object with additional properties
 * @example
 * class CreepMixin extends Creep {
 *   hasBodyparts(type: BodyPartConstant) {
 *     return this.body.some((b) => b.type == type)
 *   }
 * }
 * applyMixin(Creep, CreepMixin)
 */
export function applyMixin<T, M extends T>(target: ProtoObject<T>, mixin: ProtoObject<M>) {
  Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
    Object.defineProperty(
      target.prototype,
      name,
      Object.getOwnPropertyDescriptor(mixin.prototype, name) ?? (Object.create(null) as ThisType<T>)
    )
  })
}

interface ProtoObject<T> {
  prototype: T
}
