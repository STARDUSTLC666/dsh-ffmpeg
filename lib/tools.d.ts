/**
 * 九个面向模型的视频工具：probe / cut / concat / encode / subtitle / extract / gif / frames / adjust。
 * 直接调用 ctx.tools.register 注册【编译好的 JSON Schema】参数与 canonical 输出。
 *
 * @module dsh-ffmpeg/tools
 */
import { type ResolvedFfmpegConfig } from './config.js';
import { type ProcessRunner } from './exec.js';
import { type MediaInfo } from './ffprobe.js';
/** 模型可见的内容块。 */
export interface ContentBlock {
    type: 'text';
    text: string;
}
/** 注册给 ctx.tools.register 的原始工具定义。 */
export interface FfmpegToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, unknown>;
        required?: string[];
    };
    output: {
        schema: Record<string, unknown>;
        render(args: unknown, value: unknown): ContentBlock[];
    };
    execute(args: unknown, exec: unknown): Promise<unknown>;
    timeoutMs?: number;
}
/** 生成一行人类可读的媒体摘要：容器、时长、主视频、帧率、码率、体积。 */
export declare function buildProbeSummary(media: MediaInfo): string;
/**
 * 构建七个工具定义。
 * @param config - 已解析配置。
 * @param runner - 进程执行器（生产为 subprocess 服务封装，测试可注入假实现）。
 */
export declare function buildFfmpegTools(config: ResolvedFfmpegConfig, runner: ProcessRunner): FfmpegToolDefinition[];
