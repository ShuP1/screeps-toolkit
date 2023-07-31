/**
 * {@link Object.defineProperty} where `get` is cached after first call.
 * @author warinternal 20161128
 * @param proto Object on which to add or modify the property.
 * @param propertyName Key of the property.
 * @param get Function to compute the property value.
 * @param enumerable Is the property listed in {@link Object.keys}. (Optional: default to false)
 * @example defineCachedProperty(Creep.prototype, "bodyParts", (c) => _.countBy(c.body, part => part.type))
 */
export function defineCachedProperty<T, R>(
  proto: T,
  propertyName: PropertyKey,
  get: (it: T) => R,
  enumerable = false
) {
  Object.defineProperty(proto, propertyName, {
    get: function (this: T) {
      if (this === proto || this == null) return null
      const result = get.call(this, this)
      Object.defineProperty(this, propertyName, {
        value: result,
        configurable: true,
        enumerable: false,
      })
      return result
    },
    configurable: true,
    enumerable,
  })
}
