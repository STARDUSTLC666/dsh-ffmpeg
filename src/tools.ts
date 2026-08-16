/**
 * 七个面向模型的视频工具：probe / cut / concat / encode / subtitle / extract / gif。
 * 直接调用 ctx.tools.register 注册【编译好的 JSON Schema】参数与 canonical 输出。
 *
 * @module dsh-ffmpeg/tools
 */

import { rmSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join } from 'node:path'
import {
  concatArgs, concatListContent, cutArgs, ENCODE_PRESETS, encodeArgs,
  extractArgs, fmtSeconds, gifPaletteArgs, gifUseArgs, probeArgs, subtitleArgs,
  type EncodePreset, type ExtractWhat,
} from './args.js'
import { type ResolvedFfmpegConfig } from './config.js'
import { type ProcessRunner, type RunResult } from './exec.js'
import { parseProbeJson, type MediaInfo } from './ffprobe.js'
import { assertInputFile, resolveOutputPath, sanitizeName } from './paths.js'
import { parseTimeArg } from './config.js'

/** 模型可见的内容块。 */
export interface ContentBlock {
  type: 'text'
  text: string
}

/** 注册给 ctx.tools.register 的原始工具定义。 */
export interface FfmpegToolDefinition {
  name: string
  description: string
  parameters: { type: 'object'; properties: Record<string, unknown>; required?: string[] }
  output: {
    schema: Record<string, unknown>
    render(args: unknown, value: unknown): ContentBlock[]
  }
  execute(args: unknown, exec: unknown): Promise<unknown>
  timeoutMs?: number
}

/** 编译作者 DSL 为原始 JSON Schema（正是 defineTool 存为 definition.parameters 的值）。 */
function compileParameters(spec: Record<string, any>): { type: 'object'; properties: Record<string, unknown>; required?: string[] } {
  const properties: Record<string, unknown> = {}
  const required: string[] = []
  for (const [key, prop] of Object.entries(spec)) {
    if (prop?.required === true) required.push(key)
    const node: Record<string, unknown> = {}
    if (typeof prop?.type === 'string') node.type = prop.type
    if (typeof prop?.description === 'string') node.description = prop.description
    if (prop?.type === 'array' && prop.items !== null && typeof prop.items === 'object') {
      node.items = { type: 'string' }
    }
    properties[key] = node
  }
  return { type: 'object', properties, ...(required.length > 0 ? { required } : {}) }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function optionalString(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key]
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

function requiredString(args: Record<string, unknown>, key: string, label: string): string {
  const value = optionalString(args, key)
  if (value === undefined) throw new Error(label + '（参数 ' + key + '）为必填，请提供非空字符串。')
  return value
}

function optionalNumber(args: Record<string, unknown>, key: string): number | undefined {
  const value = args[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function requiredTime(args: Record<string, unknown>, key: string, label: string): number {
  const value = parseTimeArg(args[key])
  if (value === null) throw new Error(label + '（参数 ' + key + '）非法：请用秒数或 HH:MM:SS[.mmm] 格式。')
  return value
}

function optionalTime(args: Record<string, unknown>, key: string): number | undefined {
  const value = parseTimeArg(args[key])
  return value === null ? undefined : value
}

function stringArray(args: Record<string, unknown>, key: string): string[] {
  const value = args[key]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim())
}

/** 执行并检查退出码；非零抛中文错误（附 stderr 尾部）。 */
async function runChecked(runner: ProcessRunner, argv: string[], timeoutMs: number, label: string): Promise<RunResult> {
  const result = await runner.run(argv, { timeoutMs })
  if (result.exitCode !== 0) {
    const tail = result.stderr.trim().split(/\r?\n/).slice(-6).join(' | ')
    throw new Error(label + '失败（退出码 ' + String(result.exitCode ?? 'null') + (result.signal ? '，信号 ' + result.signal : '') + '）：' + (tail || '无错误输出'))
  }
  return result
}

function buildTextRenderer(lines: (args: unknown, value: unknown) => string[]): (args: unknown, value: unknown) => ContentBlock[] {
  return (args, value) => [{ type: 'text', text: lines(args, value).join('\n') }]
}

// ---------- 输出 JSON Schema ----------

const baseSchema = { type: 'object', additionalProperties: true } as const

const videoStreamSchema = {
  type: 'object',
  properties: { width: { type: 'number' }, height: { type: 'number' }, fps: { type: 'number' }, codec: { type: 'string' }, durationSeconds: { type: 'number' }, bitrate: { type: 'number' } },
  additionalProperties: true,
}

const audioStreamSchema = {
  type: 'object',
  properties: { codec: { type: 'string' }, sampleRate: { type: 'number' }, channels: { type: 'number' }, durationSeconds: { type: 'number' } },
  additionalProperties: true,
}

const subtitleStreamSchema = {
  type: 'object',
  properties: { codec: { type: 'string' }, language: { type: 'string' } },
  additionalProperties: true,
}

const probeSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    input: { type: 'string' },
    formatName: { type: 'string' },
    durationSeconds: { type: 'number' },
    sizeBytes: { type: 'number' },
    bitrate: { type: 'number' },
    video: videoStreamSchema,
    videos: { type: 'array', items: videoStreamSchema },
    audio: { type: 'array', items: audioStreamSchema },
    subtitles: { type: 'array', items: subtitleStreamSchema },
  },
  additionalProperties: true,
}

const produceSchema = {
  type: 'object',
  properties: { output: { type: 'string' } },
  additionalProperties: true,
}

// ---------- 工具构建 ----------

/**
 * 构建七个工具定义。
 * @param config - 已解析配置。
 * @param runner - 进程执行器（生产为 subprocess 服务封装，测试可注入假实现）。
 */
export function buildFfmpegTools(config: ResolvedFfmpegConfig, runner: ProcessRunner): FfmpegToolDefinition[] {
  const cfg = config
  const timeout = cfg.timeoutMs

  const probe: FfmpegToolDefinition = {
    name: 'ffmpeg_probe',
    description: '探测媒体文件信息：容器格式、时长、体积、码率，以及视频流（分辨率/帧率/编码）、音频流、字幕流。所有后续处理前建议先 probe。',
    parameters: compileParameters({
      input: { type: 'string', required: true, description: '媒体文件路径（必填）。' },
    }),
    output: {
      schema: probeSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        const videos = Array.isArray(rec.videos) ? rec.videos : []
        const video = videos.length > 0 ? asRecord(videos[0]) : asRecord(rec.video)
        const lines = ['媒体信息（' + rec.input + '）：']
        lines.push('- 容器：' + rec.formatName + '，时长：' + (rec.durationSeconds ?? '未知') + ' 秒，大小：' + (rec.sizeBytes ?? '未知') + ' 字节')
        if (videos.length > 0) {
          lines.push('- 视频流 ' + videos.length + ' 个；主视频：' + video.codec + ' ' + video.width + 'x' + video.height + '，帧率：' + (video.fps ?? '未知'))
        }
        lines.push('- 音频流：' + (Array.isArray(rec.audio) ? rec.audio.length : 0) + ' 个，字幕流：' + (Array.isArray(rec.subtitles) ? rec.subtitles.length : 0) + ' 个')
        return lines
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const input = assertInputFile(requiredString(args, 'input', '输入文件'))
      const result = await runChecked(runner, probeArgs(cfg.ffprobePath, input), Math.min(timeout, 60000), 'ffprobe')
      const media: MediaInfo = parseProbeJson(result.stdout)
      return { ok: true, input, ...media }
    },
    timeoutMs: Math.min(timeout, 60000),
  }

  const cut: FfmpegToolDefinition = {
    name: 'ffmpeg_cut',
    description: '剪辑视频片段。默认流拷贝（极快、关键帧对齐）；reencode=true 时精确到帧重编码（慢）。start 为起始时间（秒或 HH:MM:SS.mmm，默认 0）；end 与 duration 至少给一个（end 优先）。输出默认放在输入同目录，同名自动加序号。',
    parameters: compileParameters({
      input: { type: 'string', required: true, description: '输入文件（必填）。' },
      start: { type: 'string', description: '起始时间（秒或 HH:MM:SS.mmm，默认 0）。' },
      end: { type: 'string', description: '结束时间；与 duration 至少给一个。' },
      duration: { type: 'string', description: '片段时长；与 end 至少给一个。' },
      output: { type: 'string', description: '输出路径（可选，默认输入同目录加 .cut 后缀）。' },
      reencode: { type: 'boolean', description: '是否精确重编码（默认 false=流拷贝）。' },
    }),
    output: {
      schema: produceSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        return ['剪辑完成：' + rec.output + '（' + fmtSeconds(Number(rec.duration ?? 0)) + ' 秒' + (rec.reencode === true ? '，已重编码' : '，流拷贝') + '）']
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const input = assertInputFile(requiredString(args, 'input', '输入文件'))
      const start = optionalTime(args, 'start') ?? 0
      const end = optionalTime(args, 'end')
      let duration: number
      if (end !== undefined) {
        duration = end - start
        if (duration <= 0) throw new Error('end 必须晚于 start。')
      } else {
        duration = requiredTime(args, 'duration', '片段时长')
        if (duration <= 0) throw new Error('duration 必须大于 0。')
      }
      const reencode = args.reencode === true
      const output = resolveOutputPath(input, optionalString(args, 'output'), '.cut', extname(input) || '.mp4', cfg.overwrite)
      await runChecked(runner, cutArgs(cfg.ffmpegPath, { input, start, duration, output, overwrite: cfg.overwrite, reencode }), timeout, 'ffmpeg 剪辑')
      return { output, start, duration, reencode }
    },
    timeoutMs: timeout,
  }

  const concat: FfmpegToolDefinition = {
    name: 'ffmpeg_concat',
    description: '拼接多个视频片段。默认要求编码一致（流拷贝，秒级完成）；reencode=true 时任意格式统一重编码拼接（慢）。inputs 为 2-20 个文件路径。',
    parameters: compileParameters({
      inputs: { type: 'array', items: { type: 'string' }, required: true, description: '输入文件路径数组（2-20 个，必填）。' },
      output: { type: 'string', description: '输出路径（可选，默认第一个输入同目录加 .concat 后缀）。' },
      reencode: { type: 'boolean', description: '是否统一重编码拼接（默认 false=流拷贝）。' },
    }),
    output: {
      schema: produceSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        return ['拼接完成：' + rec.output + '（' + rec.count + ' 个片段' + (rec.reencode === true ? '，已重编码' : '，流拷贝') + '）']
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const inputs = stringArray(args, 'inputs')
      if (inputs.length < 2) throw new Error('inputs 至少需要 2 个文件（当前 ' + inputs.length + ' 个）。')
      if (inputs.length > 20) throw new Error('inputs 最多 20 个文件（当前 ' + inputs.length + ' 个）。')
      const absolute = inputs.map(assertInputFile)
      const reencode = args.reencode === true
      const firstExt = extname(absolute[0]) || '.mp4'
      const output = resolveOutputPath(absolute[0], optionalString(args, 'output'), '.concat', firstExt, cfg.overwrite)
      if (!reencode) {
        const listPath = join(tmpdir(), 'dsh-ffmpeg-concat-' + Date.now() + '-' + randomUUID().slice(0, 8) + '.txt')
        writeFileSync(listPath, concatListContent(absolute), 'utf8')
        try {
          await runChecked(runner, concatArgs(cfg.ffmpegPath, { inputs: absolute, listFilePath: listPath, output, overwrite: cfg.overwrite, reencode: false }), timeout, 'ffmpeg 拼接')
        } finally {
          rmSync(listPath, { force: true })
        }
      } else {
        await runChecked(runner, concatArgs(cfg.ffmpegPath, { inputs: absolute, output, overwrite: cfg.overwrite, reencode: true }), timeout, 'ffmpeg 拼接')
      }
      return { output, count: absolute.length, reencode }
    },
    timeoutMs: timeout,
  }

  const encode: FfmpegToolDefinition = {
    name: 'ffmpeg_encode',
    description: '转码输出。预设：bilibili-1080p（H.264+AAC，码率上限 6000k，faststart，B 站推荐）、bilibili-4k（上限 20000k）、vertical-1080p（竖屏 1080x1920）、web-720p（轻量）。可选覆盖 crf（0-51）、fps、scale（如 1920:1080）。',
    parameters: compileParameters({
      input: { type: 'string', required: true, description: '输入文件（必填）。' },
      preset: { type: 'string', description: '预设档位：bilibili-1080p / bilibili-4k / vertical-1080p / web-720p（默认 bilibili-1080p）。' },
      crf: { type: 'integer', description: '质量系数 0-51，越小越清晰（可选，覆盖预设）。' },
      fps: { type: 'number', description: '输出帧率（可选）。' },
      scale: { type: 'string', description: '输出分辨率，如 1920:1080 或 -2:720（可选）。' },
      output: { type: 'string', description: '输出路径（可选，默认输入同目录加 .encoded 后缀）。' },
    }),
    output: {
      schema: produceSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        return ['转码完成：' + rec.output + '（预设 ' + rec.preset + '，crf=' + rec.crf + '）']
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const input = assertInputFile(requiredString(args, 'input', '输入文件'))
      const presetRaw = optionalString(args, 'preset') ?? 'bilibili-1080p'
      if (!ENCODE_PRESETS.includes(presetRaw as EncodePreset)) {
        throw new Error('preset 必须是 ' + ENCODE_PRESETS.join(' / ') + ' 之一（当前：' + presetRaw + '）。')
      }
      const preset = presetRaw as EncodePreset
      let crf: number | undefined
      const crfRaw = args.crf
      if (crfRaw !== undefined) {
        if (typeof crfRaw !== 'number' || !Number.isInteger(crfRaw) || crfRaw < 0 || crfRaw > 51) throw new Error('crf 必须是 0-51 的整数。')
        crf = crfRaw
      }
      let fps: number | undefined
      const fpsRaw = optionalNumber(args, 'fps')
      if (fpsRaw !== undefined) {
        if (fpsRaw <= 0 || fpsRaw > 240) throw new Error('fps 必须是 0-240 之间的正数。')
        fps = fpsRaw
      }
      let scale: string | undefined
      const scaleRaw = optionalString(args, 'scale')
      if (scaleRaw !== undefined) {
        if (!/^-?\d+:-?\d+$/.test(scaleRaw)) throw new Error('scale 格式必须是 宽:高，如 1920:1080 或 -2:720。')
        scale = scaleRaw
      }
      const output = resolveOutputPath(input, optionalString(args, 'output'), '.encoded', extname(input) || '.mp4', cfg.overwrite)
      await runChecked(runner, encodeArgs(cfg.ffmpegPath, { input, output, preset, crf, fps, scale, overwrite: cfg.overwrite }), timeout, 'ffmpeg 转码')
      return { output, preset, crf: crf ?? 'preset', fps: fps ?? null, scale: scale ?? null }
    },
    timeoutMs: timeout,
  }

  const subtitle: FfmpegToolDefinition = {
    name: 'ffmpeg_subtitle',
    description: '把字幕文件（SRT/ASS 等）烧录进视频画面（硬字幕，任何播放器可见）。subtitle 为字幕文件路径。',
    parameters: compileParameters({
      input: { type: 'string', required: true, description: '输入视频（必填）。' },
      subtitle: { type: 'string', required: true, description: '字幕文件路径（SRT/ASS，必填）。' },
      output: { type: 'string', description: '输出路径（可选，默认输入同目录加 .sub 后缀）。' },
    }),
    output: {
      schema: produceSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        return ['字幕烧录完成：' + rec.output + '（硬字幕）']
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const input = assertInputFile(requiredString(args, 'input', '输入视频'))
      const subtitlePath = assertInputFile(requiredString(args, 'subtitle', '字幕文件'))
      const output = resolveOutputPath(input, optionalString(args, 'output'), '.sub', extname(input) || '.mp4', cfg.overwrite)
      await runChecked(runner, subtitleArgs(cfg.ffmpegPath, { input, subtitle: subtitlePath, output, overwrite: cfg.overwrite }), timeout, 'ffmpeg 字幕')
      return { output, mode: 'burn' }
    },
    timeoutMs: timeout,
  }

  const extract: FfmpegToolDefinition = {
    name: 'ffmpeg_extract',
    description: '提取媒体成分。what=audio 提取音轨（流拷贝 m4a）；what=frames 按 fps 抽帧序列（输出为含 %03d 的 PNG 序列）；what=frame 抽单帧（start 时刻，默认首帧）；what=subtitle 提取字幕流（streamIndex 默认 0）。',
    parameters: compileParameters({
      input: { type: 'string', required: true, description: '输入文件（必填）。' },
      what: { type: 'string', required: true, description: '提取内容：audio / frames / frame / subtitle（必填）。' },
      output: { type: 'string', description: '输出路径（可选，frames 默认 输入名-%03d.png）。' },
      start: { type: 'string', description: '起始时间（可选）。' },
      duration: { type: 'string', description: '时长（frames 用，可选）。' },
      fps: { type: 'number', description: '抽帧帧率（frames 用，默认 1）。' },
      streamIndex: { type: 'integer', description: '字幕流序号（subtitle 用，默认 0）。' },
    }),
    output: {
      schema: produceSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        return ['提取完成（' + rec.what + '）：' + rec.output]
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const input = assertInputFile(requiredString(args, 'input', '输入文件'))
      const what = requiredString(args, 'what', '提取内容')
      const allowed: ExtractWhat[] = ['audio', 'frames', 'frame', 'subtitle']
      if (!allowed.includes(what as ExtractWhat)) throw new Error('what 必须是 ' + allowed.join(' / ') + ' 之一（当前：' + what + '）。')
      const start = optionalTime(args, 'start')
      const duration = optionalTime(args, 'duration')
      const fps = optionalNumber(args, 'fps')
      const streamIndex = typeof args.streamIndex === 'number' && Number.isInteger(args.streamIndex) && args.streamIndex >= 0 ? args.streamIndex : 0
      let output: string
      if (what === 'audio') {
        output = resolveOutputPath(input, optionalString(args, 'output'), '.audio', '.m4a', cfg.overwrite)
      } else if (what === 'frame') {
        output = resolveOutputPath(input, optionalString(args, 'output'), '.frame', '.png', cfg.overwrite)
      } else if (what === 'subtitle') {
        output = resolveOutputPath(input, optionalString(args, 'output'), '.subtitle', '.srt', cfg.overwrite)
      } else {
        const explicit = optionalString(args, 'output')
        if (explicit !== undefined) {
          if (explicit.includes('%')) {
            output = explicit
          } else {
            const explicitExt = extname(explicit)
            output = explicitExt === '' ? explicit + '-%03d.png' : explicit.slice(0, -explicitExt.length) + '-%03d' + explicitExt
          }
        } else {
          output = join(dirname(input), sanitizeName(basename(input, extname(input))) + '-%03d.png')
        }
      }
      await runChecked(runner, extractArgs(cfg.ffmpegPath, { input, what: what as ExtractWhat, output, overwrite: cfg.overwrite, start, duration, fps, streamIndex }), timeout, 'ffmpeg 提取')
      return { output, what, start: start ?? null, duration: duration ?? null, fps: fps ?? null, streamIndex }
    },
    timeoutMs: timeout,
  }

  const gif: FfmpegToolDefinition = {
    name: 'ffmpeg_gif',
    description: '视频转高质量 GIF（两遍调色板）。start 默认 0；duration 默认 10 秒；fps 默认 10（1-30）；width 默认 480（64-1280）。',
    parameters: compileParameters({
      input: { type: 'string', required: true, description: '输入视频（必填）。' },
      start: { type: 'string', description: '起始时间（默认 0）。' },
      duration: { type: 'string', description: '时长（默认 10 秒）。' },
      fps: { type: 'integer', description: '帧率 1-30（默认 10）。' },
      width: { type: 'integer', description: '输出宽度 64-1280（默认 480）。' },
      output: { type: 'string', description: '输出路径（可选，默认输入同目录加 .gif 后缀）。' },
    }),
    output: {
      schema: produceSchema,
      render: buildTextRenderer((_args, value) => {
        const rec = asRecord(value)
        return ['GIF 生成完成：' + rec.output + '（' + rec.width + 'px，' + rec.fps + 'fps，' + fmtSeconds(Number(rec.duration ?? 0)) + ' 秒）']
      }),
    },
    async execute(rawArgs: unknown) {
      const args = asRecord(rawArgs)
      const input = assertInputFile(requiredString(args, 'input', '输入视频'))
      const start = optionalTime(args, 'start') ?? 0
      const duration = optionalTime(args, 'duration') ?? 10
      if (duration <= 0) throw new Error('duration 必须大于 0。')
      const fpsRaw = args.fps
      const fps = typeof fpsRaw === 'number' && Number.isInteger(fpsRaw) ? Math.min(30, Math.max(1, fpsRaw)) : 10
      const widthRaw = args.width
      const width = typeof widthRaw === 'number' && Number.isInteger(widthRaw) ? Math.min(1280, Math.max(64, widthRaw)) : 480
      const output = resolveOutputPath(input, optionalString(args, 'output'), '.gif', '.gif', cfg.overwrite)
      const palettePath = output + '.palette.png'
      const spec = { input, output, palettePath, overwrite: cfg.overwrite, start, duration, fps, width }
      try {
        await runChecked(runner, gifPaletteArgs(cfg.ffmpegPath, spec), timeout, 'ffmpeg GIF 调色板')
        await runChecked(runner, gifUseArgs(cfg.ffmpegPath, spec), timeout, 'ffmpeg GIF 合成')
      } finally {
        rmSync(palettePath, { force: true })
      }
      return { output, start, duration, fps, width }
    },
    timeoutMs: timeout,
  }

  return [probe, cut, concat, encode, subtitle, extract, gif]
}
