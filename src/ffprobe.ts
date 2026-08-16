/**
 * ffprobe JSON 输出解析：格式信息 + 视频/音频/字幕流归一化。
 *
 * @module dsh-ffmpeg/ffprobe
 */

/** 视频流信息。 */
export interface VideoStreamInfo {
  width: number
  height: number
  fps: number | null
  codec: string
  durationSeconds: number | null
  bitrate: number | null
}

/** 音频流信息。 */
export interface AudioStreamInfo {
  codec: string
  sampleRate: number | null
  channels: number | null
  durationSeconds: number | null
}

/** 字幕流信息。 */
export interface SubtitleStreamInfo {
  codec: string
  language: string | null
}

/** 归一化后的媒体信息。 */
export interface MediaInfo {
  formatName: string
  durationSeconds: number | null
  sizeBytes: number | null
  bitrate: number | null
  /** 第一个视频流（保持旧字段兼容）。 */
  video: VideoStreamInfo | null
  /** 全部视频流（多机位/多角度视频可完整枚举）。 */
  videos: VideoStreamInfo[]
  audio: AudioStreamInfo[]
  subtitles: SubtitleStreamInfo[]
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && value.trim().toLowerCase() !== 'n/a') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/**
 * 解析帧率字符串（如 30000/1001）为浮点；失败返回 null。
 */
function parseFps(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string') {
    const parts = value.split('/')
    if (parts.length === 2) {
      const top = Number(parts[0])
      const bottom = Number(parts[1])
      if (Number.isFinite(top) && Number.isFinite(bottom) && bottom !== 0) return top / bottom
    }
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

/**
 * 解析 ffprobe -print_format json 输出。
 * @param text - ffprobe 的 stdout。
 * @throws 输出不是合法 JSON 时抛中文错误。
 */
export function parseProbeJson(text: string): MediaInfo {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (error) {
    throw new Error('ffprobe 输出解析失败：' + (error instanceof Error ? error.message : String(error)))
  }
  const root = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const format = (typeof root.format === 'object' && root.format !== null ? root.format : {}) as Record<string, unknown>
  const streams = Array.isArray(root.streams) ? root.streams as Array<Record<string, unknown>> : []
  const videos: VideoStreamInfo[] = []
  const audio: AudioStreamInfo[] = []
  const subtitles: SubtitleStreamInfo[] = []
  for (const stream of streams) {
    const codecType = str(stream.codec_type)
    if (codecType === 'video') {
      videos.push({
        width: num(stream.width) ?? 0,
        height: num(stream.height) ?? 0,
        fps: parseFps(stream.avg_frame_rate) ?? parseFps(stream.r_frame_rate),
        codec: str(stream.codec_name),
        durationSeconds: num(stream.duration) ?? null,
        bitrate: num(stream.bit_rate) ?? null,
      })
    } else if (codecType === 'audio') {
      audio.push({
        codec: str(stream.codec_name),
        sampleRate: num(stream.sample_rate) ?? null,
        channels: num(stream.channels) ?? null,
        durationSeconds: num(stream.duration) ?? null,
      })
    } else if (codecType === 'subtitle') {
      const tags = (typeof stream.tags === 'object' && stream.tags !== null ? stream.tags : {}) as Record<string, unknown>
      subtitles.push({
        codec: str(stream.codec_name),
        language: typeof tags.language === 'string' ? tags.language : null,
      })
    }
  }
  return {
    formatName: str(format.format_name),
    durationSeconds: num(format.duration) ?? null,
    sizeBytes: num(format.size) ?? null,
    bitrate: num(format.bit_rate) ?? null,
    video: videos[0] ?? null,
    videos,
    audio,
    subtitles,
  }
}
