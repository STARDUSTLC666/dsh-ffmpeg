/**
 * 路径与文件校验：输入存在性、输出命名（防覆写）、文件名清洗。
 *
 * @module dsh-ffmpeg/paths
 */
import { existsSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'

/** 校验输入文件存在且是文件；返回绝对路径。 */
export function assertInputFile(input: string): string {
  const absolute = resolve(input)
  if (!existsSync(absolute)) {
    throw new Error('输入文件不存在：' + input)
  }
  return absolute
}

/** 清洗文件名中的危险字符。 */
export function sanitizeName(name: string): string {
  const cleaned = name.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').slice(0, 120)
  return cleaned === '' ? 'output' : cleaned
}

/**
 * 决定输出路径：缺省时放在输入同目录，名字 = 输入名 + suffix + ext。
 * 目标已存在且不允许覆写时自动追加 _1/_2…。
 */
export function resolveOutputPath(input: string, explicit: string | undefined, suffix: string, ext: string, overwrite: boolean): string {
  let target: string
  if (explicit !== undefined && explicit.trim() !== '') {
    target = resolve(explicit.trim())
  } else {
    const base = basename(input, extname(input))
    target = join(dirname(input), sanitizeName(base) + suffix + ext)
  }
  if (target.toLowerCase() === resolve(input).toLowerCase()) {
    throw new Error('输出路径与输入文件相同，已拒绝（避免覆盖源文件）。')
  }
  if (overwrite || !existsSync(target)) return target
  const directory = dirname(target)
  const base = basename(target, extname(target))
  const extension = extname(target)
  for (let index = 1; index < 1000; index++) {
    const candidate = join(directory, base + '_' + index + extension)
    if (!existsSync(candidate)) return candidate
  }
  throw new Error('找不到可用的输出文件名（同名文件超过 999 个），请显式指定 output。')
}
