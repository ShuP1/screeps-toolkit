import { getControllerCumulatedProgress } from "../structure/controller"
import { movingAverage } from "../utils/number"

/**
 * Standard speedrun timer visual
 * @param state metrics data
 * @param startTime speedrun start {@link Game.time}
 * @param avgDuration upgrade speed average duration
 * @returns a function to display speedrun visuals
 */
export function getSpeedrunVisualDrawer(state = {}, startTime = Game.time, avgDuration = 100) {
  const data = state as {
    start?: number
    rcl?: number[]
    roomName: string
    cumulatedProgress: number
    ept: number
  }
  return (position = { x: 1, y: 1 }) => {
    const rooms = Object.values(Game.rooms)
      .map((r) => r.controller)
      .filter((c) => c?.my)
    const ctrl = rooms[0]
    if (!ctrl || rooms.length > 1) return

    data.start ??= startTime
    const nextProgress = getControllerCumulatedProgress(ctrl)
    if (data.rcl === undefined || data.roomName != ctrl.room.name) {
      data.rcl = []
      data.roomName = ctrl.room.name
      data.ept = 0
      data.cumulatedProgress = nextProgress
    }
    for (let l = data.rcl.length; l <= ctrl.level; l++) {
      data.rcl[l] = Game.time
    }
    data.ept = movingAverage(data.ept, avgDuration, nextProgress - data.cumulatedProgress)
    data.cumulatedProgress = nextProgress

    const visual = ctrl.room.visual
    const x = position.x
    let y = position.y
    visual.text("Speedrun Statistics:", x, y++, { align: "left", color: "#00CCFF" })
    for (let c = 2; c <= ctrl.level; c++) {
      const delay = data.rcl[c] - data.rcl[c - 1]
      visual.text(
        `RCL ${c}: ${delimit(delay)} (${delimit(data.rcl[c] - data.start)}) - Avg. CP: ${
          Math.floor((CONTROLLER_LEVELS[c - 1] / delay) * 10) / 10
        }e/t`,
        x,
        y++,
        { align: "left" }
      )
    }

    visual.text(`Next RCL: ${ctrl.level + 1}`, x, y++, { align: "left", color: "#AACCFF" })
    visual.text(
      `Progress: ${delimit(ctrl.progress)} / ${delimit(ctrl.progressTotal)} (${
        Math.floor((ctrl.progress / ctrl.progressTotal) * 1000) / 10
      }%)`,
      x,
      y++,
      { align: "left" }
    )
    visual.text(
      `Elapsed: ${delimit(Game.time - data.rcl[ctrl.level])} (${delimit(Game.time - data.start)})`,
      x,
      y++,
      { align: "left" }
    )
    if (data.ept == 0) {
      visual.text("Estimated RCL: No Data", x, y++, { align: "left" })
    } else {
      const tickEstimate = Game.time + Math.floor((ctrl.progressTotal - ctrl.progress) / data.ept)
      visual.text(
        `Estimated RCL: T+${delimit(tickEstimate - Game.time)} (${delimit(
          tickEstimate - data.start
        )})`,
        x,
        y++,
        { align: "left" }
      )
    }
    visual.text(`Avg. Control Points: ${data.ept.toFixed(1)}e/t`, x, y++, { align: "left" })
  }
}
function delimit(n: number) {
  const raw = n.toString()
  const dot = raw.indexOf(".")
  const dec = dot < 0 ? raw.length : dot
  const skip = dec % 3
  let str = raw.substring(0, skip)
  for (let i = skip; i < dec; i += 3) {
    if (str.length) str += ","
    str += raw.substring(i, i + 3)
  }
  if (dot >= 0) str += raw.substring(dot)
  return str
}
