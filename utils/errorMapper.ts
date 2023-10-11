import { SourceMapConsumer, RawSourceMap } from "source-map"
import { htmlEscape } from "../client-abuse/linkTo"
import { IS_SIM } from "./constants"

/**
 * Try-catch wrapper which print original source stack using source map.
 * @param fn Function to call
 * @param minimumBucket Skip source mapper if bucket is too low (default: 100)
 * @returns Wrapper function
 */
export function wrapErrorMapper(fn: () => void, minimumBucket = 100): () => void {
  return () => {
    try {
      fn()
    } catch (e) {
      if (e instanceof Error) {
        if (IS_SIM) {
          consoleError(
            "Source maps don't work in the simulator - displaying original error\n" +
              (e.stack ?? "")
          )
        } else if (Game.cpu.bucket < minimumBucket) {
          consoleError("No enough cpu to map error\n" + (e.stack ?? ""))
        } else {
          consoleError(getSourceMappedStackTrace(e))
        }
      } else {
        // can't handle it
        consoleError("Bad error: " + (e as string))
        throw e
      }
    }
  }
}
const consoleError = (s: string) =>
  console.log(`<span style='color:red'>${htmlEscape(s).replace("\n", "<br>")}</span>`)

// Cache source-map to improve performance
let consumer: SourceMapConsumer | undefined

// Cache previously mapped traces to improve performance
const cache: Record<string, string> = {}

/**
 * Generates a stack trace using a source map generate original symbol names.
 *
 * WARNING - EXTREMELY high CPU cost for first call after reset - >30 CPU! Use sparingly!
 * (Consecutive calls after a reset are more reasonable, ~0.1 CPU/ea)
 * @param error The error or original stack trace
 * @returns The source-mapped stack trace string
 */
export function getSourceMappedStackTrace(error: Error | string): string {
  const stack: string = error instanceof Error ? error.stack ?? "" : error
  if (Object.prototype.hasOwnProperty.call(cache, stack)) {
    return cache[stack]
  }

  // eslint-disable-next-line no-useless-escape
  const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm
  let match: RegExpExecArray | null
  let outStack = error.toString()

  while ((match = re.exec(stack))) {
    if (match[2] === "main") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      consumer ??= new SourceMapConsumer(require("main.js.map") as RawSourceMap)
      const pos = consumer.originalPositionFor({
        column: parseInt(match[4], 10),
        line: parseInt(match[3], 10),
      })

      if ((pos.line as number | undefined) != undefined) {
        if (pos.name) {
          outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`
        } else {
          if (match[1]) {
            // no original source file name known - use file name from given trace
            outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`
          } else {
            // no original source file name known or in given trace - omit name
            outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`
          }
        }
      } else {
        // no known position
        break
      }
    } else {
      // no more parseable lines
      break
    }
  }

  cache[stack] = outStack
  return outStack
}
