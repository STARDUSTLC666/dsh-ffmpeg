/**
 * dsh-ffmpeg 配置解析：ffmpeg/ffprobe 路径、超时、覆写策略。
 * 缺失字段给默认值；非法字段抛中文错误。
 *
 * @module dsh-ffmpeg/config
 */

/** 插件行配置（cordis.patch.yml 里的 config 段，可缺省）。 */
export interface FfmpegConfig {
  ffmpegPath?: string
  ffprobePath?: string
  timeoutMs?: number
  graceMs?: number
  overwrite?: boolean
}

/** 解析后的配置：所有字段都有值。 */
export interface ResolvedFfmpegConfig {
  ffmpegPath: string
  ffprobePath: string
  timeoutMs: number
  graceMs: number
  overwrite: boolean
}

const DEFAULT_TIMEOUT_MS = 300000
const DEFAULT_GRACE_MS = 15000

/**
 * 解析并校验配置。
 * @param config - 插件行配置（可能为 undefined/null）。
 * @throws 配置值非法时抛出中文错误。
 */
export function resolveConfig(config: FfmpegConfig | undefined | null, env: NodeJS.ProcessEnv = process.env): ResolvedFfmpegConfig {
  const cfg = config ?? {}
  const ffmpegPath = typeof cfg.ffmpegPath === 'string' && cfg.ffmpegPath.trim() !== '' ? cfg.ffmpegPath.trim() : (env.DSH_FFMPEG_PATH?.trim() || 'ffmpeg')
  const ffprobePath = typeof cfg.ffprobePath === 'string' && cfg.ffprobePath.trim() !== '' ? cfg.ffprobePath.trim() : (env.DSH_FFPROBE_PATH?.trim() || 'ffprobe')
  let timeoutMs = DEFAULT_TIMEOUT_MS
  if (cfg.timeoutMs !== undefined) {
    if (typeof cfg.timeoutMs !== 'number' || !Number.isFinite(cfg.timeoutMs) || cfg.timeoutMs <= 0) {
      throw new Error('timeoutMs 必须是大于 0 的数字（毫秒），例如 300000。')
    }
    timeoutMs = Math.min(2 * 60 * 60 * 1000, Math.max(10000, Math.round(cfg.timeoutMs)))
  }
  let graceMs = DEFAULT_GRACE_MS
  if (cfg.graceMs !== undefined) {
    if (typeof cfg.graceMs !== 'number' || !Number.isFinite(cfg.graceMs) || cfg.graceMs <= 0) {
      throw new Error('graceMs 必须是大于 0 的数字（毫秒），例如 15000。')
    }
    graceMs = Math.min(120000, Math.max(1000, Math.round(cfg.graceMs)))
  }
  const overwrite = cfg.overwrite === true
  return { ffmpegPath, ffprobePath, timeoutMs, graceMs, overwrite }
}

/**
 * 解析时间参数：接受秒数（正数）或 HH:MM:SS[.mmm] 字符串。
 * 返回秒（浮点）；非法返回 null。
 */
export function parseTimeArg(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value
  if (typeof value === 'string') {
    const text = value.trim()
    if (text === '') return null
    const clock = /^(\d{1,3}):([0-5]\d):([0-5]\d)(\.\d+)?$/.exec(text)
    if (clock) {
      return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3]) + (clock[4] ? Number(clock[4]) : 0)
    }
    const seconds = Number(text)
    if (Number.isFinite(seconds) && seconds >= 0) return seconds
  }
  return null
}
