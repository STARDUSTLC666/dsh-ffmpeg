/**
 * ffprobe JSON 输出解析：格式信息 + 视频/音频/字幕流归一化。
 *
 * @module dsh-ffmpeg/ffprobe
 */
/** 视频流信息。 */
export interface VideoStreamInfo {
    width: number;
    height: number;
    fps: number | null;
    codec: string;
    durationSeconds: number | null;
    bitrate: number | null;
}
/** 音频流信息。 */
export interface AudioStreamInfo {
    codec: string;
    sampleRate: number | null;
    channels: number | null;
    durationSeconds: number | null;
}
/** 字幕流信息。 */
export interface SubtitleStreamInfo {
    codec: string;
    language: string | null;
}
/** 归一化后的媒体信息。 */
export interface MediaInfo {
    formatName: string;
    durationSeconds: number | null;
    sizeBytes: number | null;
    bitrate: number | null;
    /** 第一个视频流（保持旧字段兼容）。 */
    video: VideoStreamInfo | null;
    /** 全部视频流（多机位/多角度视频可完整枚举）。 */
    videos: VideoStreamInfo[];
    audio: AudioStreamInfo[];
    subtitles: SubtitleStreamInfo[];
}
/**
 * 解析 ffprobe -print_format json 输出。
 * @param text - ffprobe 的 stdout。
 * @throws 输出不是合法 JSON 时抛中文错误。
 */
export declare function parseProbeJson(text: string): MediaInfo;
