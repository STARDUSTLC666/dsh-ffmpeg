/**
 * 路径与文件校验：输入存在性、输出命名（防覆写）、文件名清洗。
 *
 * @module dsh-ffmpeg/paths
 */
import { existsSync, statSync, lstatSync, realpathSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'

/** 校验输入文件存在且是文件；返回绝对路径。 */
export function assertInputFile(input: string, cwd: string = process.cwd()): string {
  const absolute = resolve(cwd, input)
  if (!existsSync(absolute)) {
    throw new Error('输入文件不存在：' + input)
  }
  if (!statSync(absolute).isFile()) {
    throw new Error('输入路径不是文件：' + input)
  }
  return absolute
}

/** 清洗文件名中的危险字符。 */
export function sanitizeName(name: string): string {
  const cleaned = name.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').slice(0, 120)
  return cleaned === '' ? 'output' : cleaned
}

function canonicalPath(file: string): string {
  let parent = resolve(file)
  const missing: string[] = []
  while (!existsSync(parent)) {
    if (lstatSync(parent, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('输出路径包含悬空链接，已拒绝：' + file)
    const next = dirname(parent)
    if (next === parent) throw new Error('无法解析输出路径：' + file)
    missing.unshift(basename(parent)); parent = next
  }
  const result = join(realpathSync(parent), ...missing)
  return process.platform === 'win32' ? result.toLowerCase() : result
}

/** Compare every source, resolving junctions/symlinks and detecting hard-link aliases. */
export function assertOutputNotSource(inputs: readonly string[], target: string, cwd = process.cwd()): void {
  const absolute = resolve(cwd, target), canonical = canonicalPath(absolute)
  const targetStat = existsSync(absolute) ? statSync(absolute, { bigint: true }) : undefined
  for (const input of inputs) {
    const source = resolve(cwd, input), sourceStat = existsSync(source) ? statSync(source, { bigint: true }) : undefined
    if (canonicalPath(source) === canonical || (targetStat && sourceStat && sourceStat.ino !== 0n && targetStat.ino === sourceStat.ino && targetStat.dev === sourceStat.dev)) {
      throw new Error('输出路径与输入文件相同或指向同一文件，已拒绝（避免覆盖源文件）。')
    }
  }
}

/** image2's -n does not protect expanded sequence files. Check a supported pattern first. */
export function resolveFramePattern(input: string, explicit: string | undefined, overwrite: boolean, cwd = process.cwd()): string {
  if (!explicit?.trim()) {
    const directory = join(dirname(input), sanitizeName(basename(input, extname(input))) + '-frames')
    mkdirSync(directory, { recursive: true })
    return join(mkdtempSync(join(directory, 'run-')), sanitizeName(basename(input, extname(input))) + '-%03d.png')
  }
  let pattern = resolve(cwd, explicit.trim())
  if (!basename(pattern).includes('%')) {
    const ext = extname(pattern)
    pattern = ext ? pattern.slice(0, -ext.length) + '-%03d' + ext : pattern + '-%03d.png'
  }
  if (dirname(pattern).includes('%')) throw new Error('序列占位符只能放在输出文件名中，不能放在目录名中。')
  const filename = basename(pattern)
  let source = '^', count = 0
  const literal = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  for (let i = 0; i < filename.length;) {
    if (filename[i] !== '%') { source += literal(filename[i++]); continue }
    if (filename[i + 1] === '%') { source += '%'; i += 2; continue }
    const marker = /^%(?:0([1-9][0-9]?))?d/.exec(filename.slice(i))
    if (!marker) throw new Error('抽帧序列文件名只支持 %d 或 %0Nd（例如 %03d），字面的 % 请写成 %%。')
    count++; source += '[0-9]{' + (marker[1] ? Number(marker[1]) : 1) + ',}'; i += marker[0].length
  }
  if (count !== 1) throw new Error('抽帧序列文件名必须包含且只包含一个 %d 或 %0Nd。')
  const matcher = new RegExp(source + '$', process.platform === 'win32' ? 'i' : '')
  const directory = dirname(pattern)
  mkdirSync(directory, { recursive: true })
  const existing = readdirSync(directory).filter(name => matcher.test(name))
  for (const name of existing) assertOutputNotSource([input], join(directory, name), cwd)
  if (!overwrite && existing.length) throw new Error('抽帧输出已存在（' + existing.length + ' 个同名序列文件），已拒绝覆盖；请更换输出目录或文件名前缀。')
  return pattern
}

/**
 * 决定输出路径：缺省时放在输入同目录，名字 = 输入名 + suffix + ext。
 * 目标已存在且不允许覆写时自动追加 _1/_2…。
 */
export function resolveOutputPath(input: string | readonly string[], explicit: string | undefined, suffix: string, ext: string, overwrite: boolean, cwd: string = process.cwd()): string {
  const inputs = typeof input === 'string' ? [input] : input
  if (!inputs.length) throw new Error('至少需要一个输入源文件。')
  const primary = resolve(cwd, inputs[0])
  let target: string
  if (explicit !== undefined && explicit.trim() !== '') {
    target = resolve(cwd, explicit.trim())
  } else {
    const base = basename(primary, extname(primary))
    target = join(dirname(primary), sanitizeName(base) + suffix + ext)
  }
  assertOutputNotSource(inputs, target, cwd)
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
