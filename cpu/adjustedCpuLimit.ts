import { CPU_BUCKET_MAX } from "./constants"

/**
 * Adjust your CPU limit per tick based on current and target bucket levels. It will never dip
 *   below a fifth of your bucket, to help out 10 CPU users.
 *
 * This uses sine functions to adjust a limit multiplier from 0 at 0 bucket, to 1 at the target
 *   bucket, to 2 at full bucket. If you are a 10 CPU user, after the multiplier hits 1.5, it will
 *   add 1 to the multiplier, so you can burn through more of the available bucket. This is to assist
 *   in taking full advantage of the free 1k bucket during reset storms.
 *
 * https://imgur.com/a/9PN5z the curve of the multiplier where the target bucket is 8k (default)
 * @author semperrabbit 20180302
 * @param target        - The bucket level you want your AI to stablize at
 *                            (Optional: defaults to 8000)
 * @param maxCpuPerTick - What you want to recognize as the max limit for your code to use
 *                            (Optional: defaults to 495)
 * @param limit         - Your current static limit
 *                            (Optional: defaults to {@link Game.cpu.limit})
 * @param bucket        - Your current bucket
 *                            (Optional: defaults to {@link Game.cpu.bucket})
 * @returns An alternative value for {@link Game.cpu.limit} helping to maintain a {@link target} bucket level.
 */
export function adjustedCPULimit(
  target = CPU_BUCKET_MAX * 0.8,
  maxCpuPerTick = 495,
  limit = Game.cpu.limit,
  bucket = Game.cpu.bucket
) {
  let multiplier = 1
  if (bucket < target) {
    multiplier = Math.sin((Math.PI * bucket) / (2 * target))
  }
  if (bucket > target) {
    // Thanks @Deign for support with the sine function below
    multiplier =
      2 + Math.sin((Math.PI * (bucket - CPU_BUCKET_MAX)) / (2 * (CPU_BUCKET_MAX - target)))
    // take care of our 10 CPU folks, to dip into their bucket reserves more...
    // help them burn through excess bucket above the target.
    if (limit === 10 && multiplier > 1.5) multiplier += 1
  }

  return clamp(Math.round(limit * 0.2), Math.round(limit * multiplier), maxCpuPerTick)
}

function clamp(min: number, val: number, max: number) {
  if (val < min) return min
  if (val > max) return max
  return val
}
