/**
 * 进程执行层：把 DSH 官方 subprocess 服务包装成 Promise 式的 ProcessRunner。
 * 全程 argv 数组、无 shell 解释——杜绝命令注入。
 *
 * @module dsh-ffmpeg/exec
 */

import { basename } from 'node:path'

/** 一次运行的结果。 */
export interface RunResult {
  exitCode: number | null
  signal: string | null
  stdout: string
  stderr: string
}

/** 可注入的进程执行器（生产用 subprocess 服务，测试用假实现）。 */
export interface ProcessRunner {
  run(argv: readonly string[], options?: { timeoutMs?: number; signal?: AbortSignal }): Promise<RunResult>
}

/** 工具所需的 ctx.subprocess 最小面。 */
export interface SubprocessHandleLike {
  done: Promise<{ exitCode: number | null; signal: string | null }>
  collected: {
    stdout?: { readFrom(offset: number): { text: string; lossy?: boolean; truncated?: boolean } }
    stderr?: { readFrom(offset: number): { text: string; lossy?: boolean; truncated?: boolean } }
  }
  terminate(): void
}

export interface SubprocessSpawnLike {
  (spec: {
    argv: readonly string[]
    cwd: string
    stdio: { stdin: 'ignore'; stdout: { maxBytes: number }; stderr: { maxBytes: number } }
    graceMs: number
    signal?: AbortSignal
  }): SubprocessHandleLike
}

const COLLECT_BYTES = 4 * 1024 * 1024

/**
 * 用 DSH subprocess 服务构造 ProcessRunner：collect 模式收流，AbortSignal 驱动超时，
 * 超时自动触发 terminate 树级升级（SIGTERM → graceMs → SIGKILL / Windows 立即强杀）。
 */
export function createSubprocessRunner(spawn: SubprocessSpawnLike, graceMs: number, defaultTimeoutMs: number): ProcessRunner {
  return {
    async run(argv, options) {
      const timeoutMs = options?.timeoutMs ?? defaultTimeoutMs
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(new Error('ffmpeg operation timed out')), timeoutMs)
      const signal = options?.signal === undefined
        ? controller.signal
        : AbortSignal.any([options.signal, controller.signal])
      let handle: SubprocessHandleLike
      try {
        handle = spawn({
          argv,
          cwd: process.cwd(),
          stdio: {
            stdin: 'ignore',
            stdout: { maxBytes: COLLECT_BYTES },
            stderr: { maxBytes: COLLECT_BYTES },
          },
          graceMs,
          signal,
        })
        const outcome = await handle.done
        // done 可能因竞态在取消之后才 resolve：以 signal 状态为准，不能当成功返回
        if (signal.aborted) throw signal.reason
        const stdoutRead = handle.collected.stdout?.readFrom(0)
        const stderrRead = handle.collected.stderr?.readFrom(0)
        // collect 上限 4MB，超出时宿主保尾丢头；ffprobe JSON 丢头必然残缺，必须在解析前点名截断
        if (stdoutRead?.lossy === true || stdoutRead?.truncated === true) {
          const program = basename(String(argv[0] ?? '')).replace(/\.exe$/i, '')
          throw new Error(program + ' 输出超过 4MB 已截断（宿主仅保留尾部、丢弃头部），无法解析完整 JSON；请缩小探测范围或改用更小的输入后重试。')
        }
        return { exitCode: outcome.exitCode, signal: outcome.signal, stdout: stdoutRead?.text ?? '', stderr: stderrRead?.text ?? '' }
      } finally {
        clearTimeout(timer)
      }
    },
  }
}
