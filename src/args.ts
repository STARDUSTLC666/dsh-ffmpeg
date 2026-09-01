/**
 * ffmpeg/ffprobe 命令行构建器：纯函数，输入业务参数输出完整 argv 数组（argv[0] 为程序）。
 * 所有参数以独立数组元素传递，绝不经过 shell 解释——用户输入无法注入命令。
 *
 * @module dsh-ffmpeg/args
 */

/** 秒数格式化为 ffmpeg 友好的定点字符串。 */
export function fmtSeconds(seconds: number): string {
  return seconds.toFixed(3)
}

/** 覆写标志：不覆写用 -n（目标存在即报错，双保险），覆写用 -y。 */
function overwriteFlag(overwrite: boolean): string {
  return overwrite ? '-y' : '-n'
}

/** 转义 filter 路径（Windows 冒号与反斜杠、单引号）。 */
export function escapeFilterPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'")
}

/** ffprobe 探测命令。 */
export function probeArgs(ffprobe: string, input: string): string[] {
  return [ffprobe, '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', input]
}

export interface CutArgsSpec {
  input: string
  start: number
  duration: number
  output: string
  overwrite: boolean
  reencode: boolean
}

/** 剪辑：流拷贝（快、关键帧对齐）或重编码（精确到帧）。 */
export function cutArgs(ffmpeg: string, spec: CutArgsSpec): string[] {
  const flag = overwriteFlag(spec.overwrite)
  if (!spec.reencode) {
    return [ffmpeg, flag, '-ss', fmtSeconds(spec.start), '-i', spec.input, '-t', fmtSeconds(spec.duration), '-c', 'copy', '-avoid_negative_ts', 'make_zero', spec.output]
  }
  return [ffmpeg, flag, '-i', spec.input, '-ss', fmtSeconds(spec.start), '-t', fmtSeconds(spec.duration), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', spec.output]
}

export interface ConcatSpec {
  inputs: string[]
  listFilePath?: string
  output: string
  overwrite: boolean
  reencode: boolean
}

/** 拼接：同编码流拷贝走 concat demuxer（需 list 文件），否则 filter_complex 重编码。 */
export function concatArgs(ffmpeg: string, spec: ConcatSpec): string[] {
  const flag = overwriteFlag(spec.overwrite)
  if (!spec.reencode) {
    return [ffmpeg, flag, '-f', 'concat', '-safe', '0', '-i', spec.listFilePath ?? '', '-c', 'copy', spec.output]
  }
  const parts: string[] = [ffmpeg, flag]
  for (const input of spec.inputs) parts.push('-i', input)
  parts.push('-filter_complex', 'concat=n=' + spec.inputs.length + ':v=1:a=1', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', spec.output)
  return parts
}

/** concat demuxer 的 list 文件内容（路径中的单引号按 ffmpeg 规则转义）。 */
export function concatListContent(inputs: string[]): string {
  return inputs.map((input) => "file '" + input.replace(/\\/g, '/').replace(/'/g, "'\\''") + "'").join('\n') + '\n'
}

export type EncodePreset = 'bilibili-1080p' | 'bilibili-4k' | 'vertical-1080p' | 'web-720p'

export const ENCODE_PRESETS: EncodePreset[] = ['bilibili-1080p', 'bilibili-4k', 'vertical-1080p', 'web-720p']

export interface EncodeSpec {
  input: string
  output: string
  preset: EncodePreset
  crf?: number
  fps?: number
  scale?: string
  overwrite: boolean
}

const PRESET_TABLE: Record<EncodePreset, { crf: number; maxrate: string; bufsize: string; vf?: string }> = {
  'bilibili-1080p': { crf: 20, maxrate: '6000k', bufsize: '12000k' },
  'bilibili-4k': { crf: 18, maxrate: '20000k', bufsize: '40000k' },
  'vertical-1080p': { crf: 20, maxrate: '6000k', bufsize: '12000k', vf: 'scale=-2:1920' },
  'web-720p': { crf: 23, maxrate: '2800k', bufsize: '5600k', vf: 'scale=-2:720' },
}

/** 转码：预设 + 可选的 crf/fps/scale 覆盖。 */
export function encodeArgs(ffmpeg: string, spec: EncodeSpec): string[] {
  const preset = PRESET_TABLE[spec.preset]
  const crf = spec.crf ?? preset.crf
  const parts: string[] = [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input]
  const vf = spec.scale !== undefined && spec.scale !== '' ? 'scale=' + spec.scale : preset.vf
  if (vf !== undefined && vf !== '') parts.push('-vf', vf)
  if (spec.fps !== undefined) parts.push('-r', String(spec.fps))
  parts.push(
    '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf),
    '-maxrate', preset.maxrate, '-bufsize', preset.bufsize,
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart', spec.output,
  )
  return parts
}

export interface SubtitleSpec {
  input: string
  subtitle: string
  output: string
  overwrite: boolean
}

/** 字幕烧录（subtitles filter，路径转义）。 */
export function subtitleArgs(ffmpeg: string, spec: SubtitleSpec): string[] {
  const filter = "subtitles='" + escapeFilterPath(spec.subtitle) + "'"
  return [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input, '-vf', filter, '-c:a', 'copy', spec.output]
}

export type ExtractWhat = 'audio' | 'frames' | 'frame' | 'subtitle'

export interface ExtractSpec {
  input: string
  what: ExtractWhat
  output: string
  overwrite: boolean
  start?: number
  duration?: number
  fps?: number
  streamIndex: number
  maxFrames?: number
}

/** 提取：音频（拷贝）/ 抽帧序列 / 单帧 / 字幕流。 */
export function extractArgs(ffmpeg: string, spec: ExtractSpec): string[] {
  const flag = overwriteFlag(spec.overwrite)
  if (spec.what === 'audio') {
    return [ffmpeg, flag, '-i', spec.input, '-vn', '-c', 'copy', spec.output]
  }
  if (spec.what === 'subtitle') {
    return [ffmpeg, flag, '-i', spec.input, '-map', '0:s:' + spec.streamIndex, '-c', 'copy', spec.output]
  }
  if (spec.what === 'frame') {
    const parts = [ffmpeg, flag, '-i', spec.input]
    if (spec.start !== undefined) parts.push('-ss', fmtSeconds(spec.start))
    parts.push('-frames:v', '1', spec.output)
    return parts
  }
  // frames 序列
  const parts = [ffmpeg, flag, '-i', spec.input]
  if (spec.start !== undefined) parts.push('-ss', fmtSeconds(spec.start))
  if (spec.duration !== undefined) parts.push('-t', fmtSeconds(spec.duration))
  if (spec.maxFrames !== undefined) parts.push('-frames:v', String(spec.maxFrames))
  parts.push('-vf', 'fps=' + (spec.fps ?? 1), spec.output)
  return parts
}

/** 定点抽帧：在指定时间点取一帧。 */
export function frameAtArgs(ffmpeg: string, spec: { input: string; time: number; output: string; overwrite: boolean }): string[] {
  const flag = overwriteFlag(spec.overwrite)
  return [ffmpeg, flag, '-ss', fmtSeconds(spec.time), '-i', spec.input, '-frames:v', '1', spec.output]
}

export interface GifSpec {
  input: string
  output: string
  palettePath: string
  overwrite: boolean
  start: number
  duration: number
  fps: number
  width: number
}

/** GIF 第一遍：调色板生成（palettegen）。 */
export function gifPaletteArgs(ffmpeg: string, spec: GifSpec): string[] {
  const filter = 'fps=' + spec.fps + ',scale=' + spec.width + ':-1:flags=lanczos,palettegen'
  return [ffmpeg, '-y', '-i', spec.input, '-ss', fmtSeconds(spec.start), '-t', fmtSeconds(spec.duration), '-vf', filter, spec.palettePath]
}

/** GIF 第二遍：paletteuse 合成。 */
export function gifUseArgs(ffmpeg: string, spec: GifSpec): string[] {
  const filter = 'fps=' + spec.fps + ',scale=' + spec.width + ':-1:flags=lanczos[x];[x][1:v]paletteuse'
  return [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input, '-ss', fmtSeconds(spec.start), '-t', fmtSeconds(spec.duration), '-i', spec.palettePath, '-filter_complex', filter, spec.output]
}

export type RotateDeg = 90 | 180 | 270

export interface AdjustSpec {
  input: string
  output: string
  overwrite: boolean
  /** 倍速：>1 加速，<1 减速（0.1-100）。 */
  speed?: number
  /** 音量：倍数（如 1.5 / 0.6）或分贝（如 -3dB）。 */
  volume?: string
  mute?: boolean
  rotate?: RotateDeg
  /** 输入是否含音频流（probe 结果），决定是否构建音频滤镜。 */
  hasAudio: boolean
}

/**
 * atempo 单滤镜只接受约 [0.5, 100]，超出范围用多个 atempo 级联
 * （0.25 → atempo=0.5,atempo=0.5）。
 */
export function atempoChain(speed: number): string {
  const parts: string[] = []
  let remaining = speed
  while (remaining < 0.5) {
    parts.push('atempo=0.5')
    remaining /= 0.5
  }
  while (remaining > 100) {
    parts.push('atempo=100')
    remaining /= 100
  }
  parts.push('atempo=' + Number(remaining.toFixed(4)))
  return parts.join(',')
}

/** 顺时针旋转滤镜：90/270 用 transpose，180 用双翻转。 */
export function rotateFilter(deg: RotateDeg): string {
  if (deg === 90) return 'transpose=1'
  if (deg === 270) return 'transpose=2'
  return 'hflip,vflip'
}

/**
 * 调整：变速（视频 setpts + 音频 atempo）、音量、静音、旋转。
 * 只静音/调音量（无变速旋转）时视频走流拷贝；动了画面就重编码。
 */
export function adjustArgs(ffmpeg: string, spec: AdjustSpec): string[] {
  const parts: string[] = [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input]
  const vf: string[] = []
  const af: string[] = []
  const audioUsable = spec.hasAudio && spec.mute !== true
  if (spec.speed !== undefined) {
    vf.push('setpts=PTS/' + spec.speed)
    if (audioUsable) af.push(atempoChain(spec.speed))
  }
  if (spec.volume !== undefined && audioUsable) af.push('volume=' + spec.volume)
  if (spec.rotate !== undefined) vf.push(rotateFilter(spec.rotate))
  if (vf.length > 0) parts.push('-vf', vf.join(','))
  if (af.length > 0) parts.push('-af', af.join(','))
  if (vf.length > 0) {
    parts.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p')
  } else {
    parts.push('-c:v', 'copy')
  }
  if (spec.mute === true || !spec.hasAudio) {
    parts.push('-an')
  } else if (af.length > 0) {
    parts.push('-c:a', 'aac', '-b:a', '192k')
  } else {
    parts.push('-c:a', 'copy')
  }
  parts.push('-movflags', '+faststart', spec.output)
  return parts
}
