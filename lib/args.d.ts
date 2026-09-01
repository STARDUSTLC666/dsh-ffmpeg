/**
 * ffmpeg/ffprobe 命令行构建器：纯函数，输入业务参数输出完整 argv 数组（argv[0] 为程序）。
 * 所有参数以独立数组元素传递，绝不经过 shell 解释——用户输入无法注入命令。
 *
 * @module dsh-ffmpeg/args
 */
/** 秒数格式化为 ffmpeg 友好的定点字符串。 */
export declare function fmtSeconds(seconds: number): string;
/** 转义 filter 路径（Windows 冒号与反斜杠、单引号）。 */
export declare function escapeFilterPath(path: string): string;
/** ffprobe 探测命令。 */
export declare function probeArgs(ffprobe: string, input: string): string[];
export interface CutArgsSpec {
    input: string;
    start: number;
    duration: number;
    output: string;
    overwrite: boolean;
    reencode: boolean;
}
/** 剪辑：流拷贝（快、关键帧对齐）或重编码（精确到帧）。 */
export declare function cutArgs(ffmpeg: string, spec: CutArgsSpec): string[];
export interface ConcatSpec {
    inputs: string[];
    listFilePath?: string;
    output: string;
    overwrite: boolean;
    reencode: boolean;
}
/** 拼接：同编码流拷贝走 concat demuxer（需 list 文件），否则 filter_complex 重编码。 */
export declare function concatArgs(ffmpeg: string, spec: ConcatSpec): string[];
/** concat demuxer 的 list 文件内容（路径中的单引号按 ffmpeg 规则转义）。 */
export declare function concatListContent(inputs: string[]): string;
export type EncodePreset = 'bilibili-1080p' | 'bilibili-4k' | 'vertical-1080p' | 'web-720p';
export declare const ENCODE_PRESETS: EncodePreset[];
export interface EncodeSpec {
    input: string;
    output: string;
    preset: EncodePreset;
    crf?: number;
    fps?: number;
    scale?: string;
    overwrite: boolean;
}
/** 转码：预设 + 可选的 crf/fps/scale 覆盖。 */
export declare function encodeArgs(ffmpeg: string, spec: EncodeSpec): string[];
export interface SubtitleSpec {
    input: string;
    subtitle: string;
    output: string;
    overwrite: boolean;
}
/** 字幕烧录（subtitles filter，路径转义）。 */
export declare function subtitleArgs(ffmpeg: string, spec: SubtitleSpec): string[];
export type ExtractWhat = 'audio' | 'frames' | 'frame' | 'subtitle';
export interface ExtractSpec {
    input: string;
    what: ExtractWhat;
    output: string;
    overwrite: boolean;
    start?: number;
    duration?: number;
    fps?: number;
    streamIndex: number;
    maxFrames?: number;
}
/** 提取：音频（拷贝）/ 抽帧序列 / 单帧 / 字幕流。 */
export declare function extractArgs(ffmpeg: string, spec: ExtractSpec): string[];
/** 定点抽帧：在指定时间点取一帧。 */
export declare function frameAtArgs(ffmpeg: string, spec: {
    input: string;
    time: number;
    output: string;
    overwrite: boolean;
}): string[];
export interface GifSpec {
    input: string;
    output: string;
    palettePath: string;
    overwrite: boolean;
    start: number;
    duration: number;
    fps: number;
    width: number;
}
/** GIF 第一遍：调色板生成（palettegen）。 */
export declare function gifPaletteArgs(ffmpeg: string, spec: GifSpec): string[];
/** GIF 第二遍：paletteuse 合成。 */
export declare function gifUseArgs(ffmpeg: string, spec: GifSpec): string[];
export type RotateDeg = 90 | 180 | 270;
export interface AdjustSpec {
    input: string;
    output: string;
    overwrite: boolean;
    /** 倍速：>1 加速，<1 减速（0.1-100）。 */
    speed?: number;
    /** 音量：倍数（如 1.5 / 0.6）或分贝（如 -3dB）。 */
    volume?: string;
    mute?: boolean;
    rotate?: RotateDeg;
    /** 输入是否含音频流（probe 结果），决定是否构建音频滤镜。 */
    hasAudio: boolean;
}
/**
 * atempo 单滤镜只接受约 [0.5, 100]，超出范围用多个 atempo 级联
 * （0.25 → atempo=0.5,atempo=0.5）。
 */
export declare function atempoChain(speed: number): string;
/** 顺时针旋转滤镜：90/270 用 transpose，180 用双翻转。 */
export declare function rotateFilter(deg: RotateDeg): string;
/**
 * 调整：变速（视频 setpts + 音频 atempo）、音量、静音、旋转。
 * 只静音/调音量（无变速旋转）时视频走流拷贝；动了画面就重编码。
 */
export declare function adjustArgs(ffmpeg: string, spec: AdjustSpec): string[];
