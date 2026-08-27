/**
 * dsh-ffmpeg 配置解析：ffmpeg/ffprobe 路径、超时、覆写策略。
 * 缺失字段给默认值；非法字段抛中文错误。
 *
 * @module dsh-ffmpeg/config
 */
/** 插件行配置（cordis.patch.yml 里的 config 段，可缺省）。 */
export interface FfmpegConfig {
    ffmpegPath?: string;
    ffprobePath?: string;
    timeoutMs?: number;
    graceMs?: number;
    overwrite?: boolean;
}
/** 解析后的配置：所有字段都有值。 */
export interface ResolvedFfmpegConfig {
    ffmpegPath: string;
    ffprobePath: string;
    timeoutMs: number;
    graceMs: number;
    overwrite: boolean;
}
/**
 * 解析并校验配置。
 * @param config - 插件行配置（可能为 undefined/null）。
 * @throws 配置值非法时抛出中文错误。
 */
export declare function resolveConfig(config: FfmpegConfig | undefined | null, env?: NodeJS.ProcessEnv): ResolvedFfmpegConfig;
/**
 * 解析时间参数：接受秒数（正数）或 HH:MM:SS[.mmm] 字符串。
 * 返回秒（浮点）；非法返回 null。
 */
export declare function parseTimeArg(value: unknown): number | null;
