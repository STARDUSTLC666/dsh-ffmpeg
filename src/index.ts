/**
 * dsh-ffmpeg —— 视频处理工具插件（node 半身，配置走 cordis.patch.yml）。
 *
 * 插件导出 apply(ctx, config)：把七个面向模型的工具（ffmpeg_probe / ffmpeg_cut /
 * ffmpeg_concat / ffmpeg_encode / ffmpeg_subtitle / ffmpeg_extract / ffmpeg_gif）注册进
 * 宿主进程的工具注册表。进程执行走 DSH 官方 subprocess 服务（argv 数组、无 shell），
 * 零运行时依赖。配置缺失时插件照常加载，工具在 execute 时才抛出带中文指引的错误。
 *
 * @module dsh-ffmpeg
 */

import { resolveConfig, type FfmpegConfig } from './config.js'
import { createSubprocessRunner, type SubprocessSpawnLike } from './exec.js'
import { buildFfmpegTools, type FfmpegToolDefinition } from './tools.js'

/** cordis 服务注入：apply 里要用 ctx.subprocess 与 ctx.tools，必须显式声明，否则宿主会抛 cannot get property without inject。 */
export const name = 'ffmpeg'
export const inject = ['subprocess', 'tools']

/** 插件所需的最小 ctx 面（社区插件不依赖宿主内部类型）。 */
export interface FfmpegPluginContext {
  subprocess: { spawn: SubprocessSpawnLike }
  tools: { register(definition: FfmpegToolDefinition): () => void }
  on?(event: string, listener: () => void): () => void
}

/**
 * 插件入口：解析配置、封装 subprocess 执行器并注册七个视频工具。
 * @param ctx - 宿主上下文（至少含 subprocess.spawn 与 tools.register）。
 * @param config - 插件配置（可缺省）。
 */
export function apply(ctx: FfmpegPluginContext, config?: FfmpegConfig | null): void {
  let cfg
  try {
    cfg = resolveConfig(config)
  } catch (error) {
    console.warn('[dsh-ffmpeg] ' + (error instanceof Error ? error.message : String(error)))
    cfg = resolveConfig(null)
  }

  const runner = createSubprocessRunner(ctx.subprocess.spawn, cfg.graceMs, cfg.timeoutMs)

  const disposers: Array<() => void> = []
  for (const definition of buildFfmpegTools(cfg, runner)) {
    disposers.push(ctx.tools.register(definition))
  }
  if (typeof ctx.on === 'function') {
    ctx.on('dispose', () => {
      for (const dispose of disposers) dispose()
    })
  }
}

export * from './args.js'
export * from './config.js'
export * from './exec.js'
export * from './ffprobe.js'
export * from './paths.js'
export * from './tools.js'
