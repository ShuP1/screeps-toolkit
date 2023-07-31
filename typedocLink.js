const known = {
  StructureController: false,
  Creep: false,
  Memory: false,
  "Structure.isActive": false,
  "StructureLab.runReaction": false,
  "StructureLab.reverseReaction": false,
  BOOSTS: "https://docs.screeps.com/api/#Constants",
  "Object.defineProperty":
    "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty",
  "Object.keys":
    "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/keys",
  Map: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
}

/**
 *
 * @type {import('typedoc-plugin-external-link').getURL}
 */
function getURL(_, ...types) {
  const type = types.join(".")
  if (known[type] !== undefined) return known[type] || `https://docs.screeps.com/api/#${type}`
  return undefined
}

// eslint-disable-next-line no-undef
module.exports = { packageNames: [undefined], getURL }
