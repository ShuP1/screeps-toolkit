/** Based on https://github.com/screepers/RoomVisual/blob/master/RoomVisual.js */

const COLORS = {
  gray: "#555555",
  light: "#AAAAAA",
  road: "#666", // >:D
  energy: "#FFE87B",
  power: "#F53547",
  dark: "#181818",
  outline: "#8FBB93",
}
type Points = [number, number][]

interface StructureStyle {
  opacity?: number
}
/**
 * Draw a {@link Structure} at given coordinates using {@link RoomVisual}.
 * @param v RoomVisual to use
 * @param x horizontal position
 * @param y vertical position
 * @param type structure identifier
 * @param opts visual parameters
 */
export function drawStructureVisual(
  v: RoomVisual,
  x: number,
  y: number,
  type: StructureConstant,
  opts: StructureStyle = {}
) {
  const opacity = opts.opacity ?? 1
  switch (type) {
    case STRUCTURE_FACTORY: {
      const outline: Points = [
        [-0.68, -0.11],
        [-0.84, -0.18],
        [-0.84, -0.32],
        [-0.44, -0.44],
        [-0.32, -0.84],
        [-0.18, -0.84],
        [-0.11, -0.68],

        [0.11, -0.68],
        [0.18, -0.84],
        [0.32, -0.84],
        [0.44, -0.44],
        [0.84, -0.32],
        [0.84, -0.18],
        [0.68, -0.11],

        [0.68, 0.11],
        [0.84, 0.18],
        [0.84, 0.32],
        [0.44, 0.44],
        [0.32, 0.84],
        [0.18, 0.84],
        [0.11, 0.68],

        [-0.11, 0.68],
        [-0.18, 0.84],
        [-0.32, 0.84],
        [-0.44, 0.44],
        [-0.84, 0.32],
        [-0.84, 0.18],
        [-0.68, 0.11],
      ]
      v.poly(relPoly(x, y, outline), {
        fill: undefined,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      // outer circle
      v.circle(x, y, {
        radius: 0.65,
        fill: "#232323",
        strokeWidth: 0.035,
        stroke: "#140a0a",
        opacity,
      })
      const spikes: Points = [
        [-0.4, -0.1],
        [-0.8, -0.2],
        [-0.8, -0.3],
        [-0.4, -0.4],
        [-0.3, -0.8],
        [-0.2, -0.8],
        [-0.1, -0.4],

        [0.1, -0.4],
        [0.2, -0.8],
        [0.3, -0.8],
        [0.4, -0.4],
        [0.8, -0.3],
        [0.8, -0.2],
        [0.4, -0.1],

        [0.4, 0.1],
        [0.8, 0.2],
        [0.8, 0.3],
        [0.4, 0.4],
        [0.3, 0.8],
        [0.2, 0.8],
        [0.1, 0.4],

        [-0.1, 0.4],
        [-0.2, 0.8],
        [-0.3, 0.8],
        [-0.4, 0.4],
        [-0.8, 0.3],
        [-0.8, 0.2],
        [-0.4, 0.1],
      ]
      v.poly(relPoly(x, y, spikes), {
        fill: COLORS.gray,
        stroke: "#140a0a",
        strokeWidth: 0.04,
        opacity,
      })
      // factory level circle
      v.circle(x, y, {
        radius: 0.54,
        fill: "#302a2a",
        strokeWidth: 0.04,
        stroke: "#140a0a",
        opacity,
      })
      v.poly(relPoly(x, y, FACTORY_LEVEL_GAPS), {
        fill: "#140a0a",
        stroke: undefined,
        opacity,
      })
      // inner black circle
      v.circle(x, y, {
        radius: 0.42,
        fill: "#140a0a",
        opacity,
      })
      v.rect(x - 0.24, y - 0.24, 0.48, 0.48, {
        fill: "#3f3f3f",
        opacity,
      })
      break
    }
    case STRUCTURE_EXTENSION:
      v.circle(x, y, {
        radius: 0.5,
        fill: COLORS.dark,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      v.circle(x, y, {
        radius: 0.35,
        fill: COLORS.gray,
        opacity,
      })
      break
    case STRUCTURE_SPAWN:
      v.circle(x, y, {
        radius: 0.65,
        fill: COLORS.dark,
        stroke: "#CCCCCC",
        strokeWidth: 0.1,
        opacity,
      })
      v.circle(x, y, {
        radius: 0.4,
        fill: COLORS.energy,
        opacity,
      })

      break
    case STRUCTURE_POWER_SPAWN:
      v.circle(x, y, {
        radius: 0.65,
        fill: COLORS.dark,
        stroke: COLORS.power,
        strokeWidth: 0.1,
        opacity,
      })
      v.circle(x, y, {
        radius: 0.4,
        fill: COLORS.energy,
        opacity,
      })
      break
    case STRUCTURE_LINK: {
      let outer: Points = [
        [0.0, -0.5],
        [0.4, 0.0],
        [0.0, 0.5],
        [-0.4, 0.0],
      ]
      let inner: Points = [
        [0.0, -0.3],
        [0.25, 0.0],
        [0.0, 0.3],
        [-0.25, 0.0],
      ]
      outer = relPoly(x, y, outer)
      inner = relPoly(x, y, inner)
      outer.push(outer[0])
      inner.push(inner[0])
      v.poly(outer, {
        fill: COLORS.dark,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      v.poly(inner, {
        fill: COLORS.gray,
        stroke: undefined,
        opacity,
      })
      break
    }
    case STRUCTURE_TERMINAL: {
      let outer: Points = [
        [0.0, -0.8],
        [0.55, -0.55],
        [0.8, 0.0],
        [0.55, 0.55],
        [0.0, 0.8],
        [-0.55, 0.55],
        [-0.8, 0.0],
        [-0.55, -0.55],
      ]
      let inner: Points = [
        [0.0, -0.65],
        [0.45, -0.45],
        [0.65, 0.0],
        [0.45, 0.45],
        [0.0, 0.65],
        [-0.45, 0.45],
        [-0.65, 0.0],
        [-0.45, -0.45],
      ]
      outer = relPoly(x, y, outer)
      inner = relPoly(x, y, inner)
      outer.push(outer[0])
      inner.push(inner[0])
      v.poly(outer, {
        fill: COLORS.dark,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      v.poly(inner, {
        fill: COLORS.light,
        stroke: undefined,
        opacity,
      })
      v.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
        fill: COLORS.gray,
        stroke: COLORS.dark,
        strokeWidth: 0.1,
        opacity,
      })
      break
    }
    case STRUCTURE_LAB:
      v.circle(x, y - 0.025, {
        radius: 0.55,
        fill: COLORS.dark,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      v.circle(x, y - 0.025, {
        radius: 0.4,
        fill: COLORS.gray,
        opacity,
      })
      v.rect(x - 0.45, y + 0.3, 0.9, 0.25, {
        fill: COLORS.dark,
        stroke: undefined,
        opacity,
      })
      {
        let box: Points = [
          [-0.45, 0.3],
          [-0.45, 0.55],
          [0.45, 0.55],
          [0.45, 0.3],
        ]
        box = relPoly(x, y, box)
        v.poly(box, {
          stroke: COLORS.outline,
          strokeWidth: 0.05,
          opacity,
        })
      }
      break
    case STRUCTURE_TOWER:
      v.circle(x, y, {
        radius: 0.6,
        fill: COLORS.dark,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      v.rect(x - 0.4, y - 0.3, 0.8, 0.6, {
        fill: COLORS.gray,
        opacity,
      })
      v.rect(x - 0.2, y - 0.9, 0.4, 0.5, {
        fill: COLORS.light,
        stroke: COLORS.dark,
        strokeWidth: 0.07,
        opacity,
      })
      break
    case STRUCTURE_ROAD:
      v.circle(x, y, {
        radius: 0.175,
        fill: COLORS.road,
        stroke: undefined,
        opacity,
      })
      break
    case STRUCTURE_RAMPART:
      v.circle(x, y, {
        radius: 0.65,
        fill: "#434C43",
        stroke: "#5D735F",
        strokeWidth: 0.1,
        opacity,
      })
      break
    case STRUCTURE_WALL:
      v.circle(x, y, {
        radius: 0.4,
        fill: COLORS.dark,
        stroke: COLORS.light,
        strokeWidth: 0.05,
        opacity,
      })
      break
    case STRUCTURE_STORAGE: {
      const outline: Points = [
        [-0.45, -0.55],
        [0, -0.65],
        [0.45, -0.55],
        [0.55, 0],
        [0.45, 0.55],
        [0, 0.65],
        [-0.45, 0.55],
        [-0.55, 0],
        [-0.45, -0.55],
      ]
      v.poly(relPoly(x, y, outline), {
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        fill: COLORS.dark,
        opacity,
      })
      v.rect(x - 0.35, y - 0.45, 0.7, 0.9, {
        fill: COLORS.energy,
        opacity,
      })
      break
    }
    case STRUCTURE_OBSERVER:
      v.circle(x, y, {
        fill: COLORS.dark,
        radius: 0.45,
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        opacity,
      })
      v.circle(x + 0.225, y, {
        fill: COLORS.outline,
        radius: 0.2,
        opacity,
      })
      break
    case STRUCTURE_NUKER: {
      let outline: Points = [
        [0, -1],
        [-0.47, 0.2],
        [-0.5, 0.5],
        [0.5, 0.5],
        [0.47, 0.2],
        [0, -1],
      ]
      outline = relPoly(x, y, outline)
      v.poly(outline, {
        stroke: COLORS.outline,
        strokeWidth: 0.05,
        fill: COLORS.dark,
        opacity,
      })
      let inline: Points = [
        [0, -0.8],
        [-0.4, 0.2],
        [0.4, 0.2],
        [0, -0.8],
      ]
      inline = relPoly(x, y, inline)
      v.poly(inline, {
        stroke: COLORS.outline,
        strokeWidth: 0.01,
        fill: COLORS.gray,
        opacity,
      })
      break
    }
    case STRUCTURE_CONTAINER:
      v.rect(x - 0.225, y - 0.3, 0.45, 0.6, {
        fill: COLORS.gray,
        opacity,
        stroke: COLORS.dark,
        strokeWidth: 0.09,
      })
      v.rect(x - 0.17, y + 0.07, 0.34, 0.2, {
        fill: COLORS.energy,
        opacity,
      })
      break
    default:
      v.circle(x, y, {
        fill: COLORS.light,
        radius: 0.35,
        stroke: COLORS.dark,
        strokeWidth: 0.2,
        opacity,
      })
      break
  }
}
const FACTORY_LEVEL_GAPS = (() => {
  const gapAngle = 16 * (Math.PI / 180)
  const c1 = Math.cos(gapAngle)
  const s1 = Math.sin(gapAngle)

  const angle = 72 * (Math.PI / 180)
  const c2 = Math.cos(angle)
  const s2 = Math.sin(angle)

  const result: Points = []
  let x = -0.08
  let y = -0.52
  for (let i = 0; i < 5; ++i) {
    result.push([0.0, 0.0])
    result.push([x, y])
    result.push([x * c1 - y * s1, x * s1 + y * c1])
    const tmpX = x * c2 - y * s2
    y = x * s2 + y * c2
    x = tmpX
  }
  return result
})()

interface RoadsStyle {
  color?: string
  opacity?: number
}
/**
 * Draw connected roads using {@link RoomVisual}
 * @param v RoomVisual to use
 * @param roads roads positions
 * @param opts visuals parameters
 */
export function drawRoadsVisual(v: RoomVisual, roads: Points, opts: RoadsStyle = {}) {
  const color = opts.color ?? COLORS.road
  const opacity = opts.opacity ?? 1
  roads.forEach((r) => {
    for (let i = 1; i <= 4; i++) {
      const d = ROAD_DIRS[i]
      const c = [r[0] + d[0], r[1] + d[1]]
      if (roads.some((r) => r[0] == c[0] && r[1] == c[1])) {
        v.line(r[0], r[1], c[0], c[1], {
          color,
          width: 0.35,
          opacity,
        })
      }
    }
  })
}
const ROAD_DIRS = [[], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]

function relPoly(x: number, y: number, poly: Points) {
  return poly.map(([vx, vy]) => [vx + x, vy + y]) as Points
}

const COLORSETS = {
  white: ["#ffffff", "#4c4c4c"],
  grey: ["#b4b4b4", "#4c4c4c"],
  red: ["#ff7b7b", "#592121"],
  yellow: ["#fdd388", "#5d4c2e"],
  green: ["#00f4a2", "#236144"],
  blue: ["#50d7f9", "#006181"],
  purple: ["#a071ff", "#371383"],
}
const RESOURCE_COLORS = {
  [RESOURCE_ENERGY]: COLORSETS.yellow,
  [RESOURCE_POWER]: COLORSETS.red,
  [RESOURCE_OPS]: COLORSETS.white,

  [RESOURCE_HYDROGEN]: COLORSETS.grey,
  [RESOURCE_OXYGEN]: COLORSETS.grey,
  [RESOURCE_UTRIUM]: COLORSETS.blue,
  [RESOURCE_LEMERGIUM]: COLORSETS.green,
  [RESOURCE_KEANIUM]: COLORSETS.purple,
  [RESOURCE_ZYNTHIUM]: COLORSETS.yellow,
  [RESOURCE_CATALYST]: COLORSETS.red,
  [RESOURCE_GHODIUM]: COLORSETS.white,

  [RESOURCE_HYDROXIDE]: COLORSETS.grey,
  [RESOURCE_ZYNTHIUM_KEANITE]: COLORSETS.grey,
  [RESOURCE_UTRIUM_LEMERGITE]: COLORSETS.grey,

  [RESOURCE_UTRIUM_HYDRIDE]: COLORSETS.blue,
  [RESOURCE_UTRIUM_OXIDE]: COLORSETS.blue,
  [RESOURCE_KEANIUM_HYDRIDE]: COLORSETS.purple,
  [RESOURCE_KEANIUM_OXIDE]: COLORSETS.purple,
  [RESOURCE_LEMERGIUM_HYDRIDE]: COLORSETS.green,
  [RESOURCE_LEMERGIUM_OXIDE]: COLORSETS.green,
  [RESOURCE_ZYNTHIUM_HYDRIDE]: COLORSETS.yellow,
  [RESOURCE_ZYNTHIUM_OXIDE]: COLORSETS.yellow,
  [RESOURCE_GHODIUM_HYDRIDE]: COLORSETS.white,
  [RESOURCE_GHODIUM_OXIDE]: COLORSETS.white,

  [RESOURCE_UTRIUM_ACID]: COLORSETS.blue,
  [RESOURCE_UTRIUM_ALKALIDE]: COLORSETS.blue,
  [RESOURCE_KEANIUM_ACID]: COLORSETS.purple,
  [RESOURCE_KEANIUM_ALKALIDE]: COLORSETS.purple,
  [RESOURCE_LEMERGIUM_ACID]: COLORSETS.green,
  [RESOURCE_LEMERGIUM_ALKALIDE]: COLORSETS.green,
  [RESOURCE_ZYNTHIUM_ACID]: COLORSETS.yellow,
  [RESOURCE_ZYNTHIUM_ALKALIDE]: COLORSETS.yellow,
  [RESOURCE_GHODIUM_ACID]: COLORSETS.white,
  [RESOURCE_GHODIUM_ALKALIDE]: COLORSETS.white,

  [RESOURCE_CATALYZED_UTRIUM_ACID]: COLORSETS.blue,
  [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: COLORSETS.blue,
  [RESOURCE_CATALYZED_KEANIUM_ACID]: COLORSETS.purple,
  [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: COLORSETS.purple,
  [RESOURCE_CATALYZED_LEMERGIUM_ACID]: COLORSETS.green,
  [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: COLORSETS.green,
  [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: COLORSETS.yellow,
  [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: COLORSETS.yellow,
  [RESOURCE_CATALYZED_GHODIUM_ACID]: COLORSETS.white,
  [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: COLORSETS.white,

  [RESOURCE_MIST]: COLORSETS.purple,
  [RESOURCE_BIOMASS]: COLORSETS.green,
  [RESOURCE_METAL]: COLORSETS.grey,
  [RESOURCE_SILICON]: COLORSETS.blue,

  [RESOURCE_UTRIUM_BAR]: COLORSETS.blue,
  [RESOURCE_LEMERGIUM_BAR]: COLORSETS.green,
  [RESOURCE_ZYNTHIUM_BAR]: COLORSETS.yellow,
  [RESOURCE_KEANIUM_BAR]: COLORSETS.purple,
  [RESOURCE_GHODIUM_MELT]: COLORSETS.white,
  [RESOURCE_OXIDANT]: COLORSETS.grey,
  [RESOURCE_REDUCTANT]: COLORSETS.grey,
  [RESOURCE_PURIFIER]: COLORSETS.red,

  [RESOURCE_BATTERY]: COLORSETS.yellow,
  [RESOURCE_COMPOSITE]: COLORSETS.white,
  [RESOURCE_CRYSTAL]: COLORSETS.white,
  [RESOURCE_LIQUID]: COLORSETS.white,

  [RESOURCE_WIRE]: COLORSETS.blue,
  [RESOURCE_SWITCH]: COLORSETS.blue,
  [RESOURCE_TRANSISTOR]: COLORSETS.blue,
  [RESOURCE_MICROCHIP]: COLORSETS.blue,
  [RESOURCE_CIRCUIT]: COLORSETS.blue,
  [RESOURCE_DEVICE]: COLORSETS.blue,

  [RESOURCE_CELL]: COLORSETS.green,
  [RESOURCE_PHLEGM]: COLORSETS.green,
  [RESOURCE_TISSUE]: COLORSETS.green,
  [RESOURCE_MUSCLE]: COLORSETS.green,
  [RESOURCE_ORGANOID]: COLORSETS.green,
  [RESOURCE_ORGANISM]: COLORSETS.green,

  [RESOURCE_ALLOY]: COLORSETS.grey,
  [RESOURCE_TUBE]: COLORSETS.grey,
  [RESOURCE_FIXTURES]: COLORSETS.grey,
  [RESOURCE_FRAME]: COLORSETS.grey,
  [RESOURCE_HYDRAULICS]: COLORSETS.grey,
  [RESOURCE_MACHINE]: COLORSETS.grey,

  [RESOURCE_CONDENSATE]: COLORSETS.purple,
  [RESOURCE_CONCENTRATE]: COLORSETS.purple,
  [RESOURCE_EXTRACT]: COLORSETS.purple,
  [RESOURCE_SPIRIT]: COLORSETS.purple,
  [RESOURCE_EMANATION]: COLORSETS.purple,
  [RESOURCE_ESSENCE]: COLORSETS.purple,
}

interface ResourceStyle {
  size?: number
  opacity?: number
}
/**
 * Draw a resource marked at given coordinates using {@link RoomVisual}.
 * @param v RoomVisual to use
 * @param x horizontal position
 * @param y vertical position
 * @param type resource identifier
 * @param opts visual parameters
 * @returns ok or error
 */
export function drawResourceVisual(
  v: RoomVisual,
  x: number,
  y: number,
  type: ResourceConstant,
  opts: ResourceStyle = {}
) {
  const radius = (opts.size ?? 1) / 4
  const opacity = opts.opacity ?? 1
  if (type == RESOURCE_ENERGY || type == RESOURCE_POWER || type == RESOURCE_OPS) {
    v.circle(x, y, {
      radius,
      fill: RESOURCE_COLORS[type][0],
      opacity,
    })
    v.text(type[0], x, y - radius * 0.1, {
      font: radius * 1.5,
      color: RESOURCE_COLORS[type][1],
      backgroundColor: RESOURCE_COLORS[type][0],
      backgroundPadding: 0,
      opacity,
    })
  } else if (type in MINERAL_MIN_AMOUNT) {
    v.circle(x, y, {
      radius,
      fill: RESOURCE_COLORS[type][0],
      opacity,
    })
    v.circle(x, y, {
      radius: radius * 0.8,
      fill: RESOURCE_COLORS[type][1],
      opacity,
    })
    v.text(type, x, y + radius * 0.03, {
      font: "bold " + (radius * 1.25).toString() + " arial",
      color: RESOURCE_COLORS[type][0],
      backgroundColor: RESOURCE_COLORS[type][1],
      backgroundPadding: 0,
      opacity,
    })
  } else if (type in RESOURCE_COLORS) {
    type = type as ResourceConstant
    v.text(type.replace("2", "₂"), x, y, {
      font: "bold " + radius.toString() + " arial",
      color: RESOURCE_COLORS[type][1],
      backgroundColor: RESOURCE_COLORS[type][0],
      backgroundPadding: 0.3 * radius,
      opacity,
    })
  } else return ERR_INVALID_ARGS
  return OK
}
