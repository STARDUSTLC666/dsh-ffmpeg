import { type ResolvedFfmpegConfig } from './config.js';
import type { ProcessRunner } from './exec.js';
import type { FfmpegToolDefinition } from './tools.js';
/** A bounded contact sheet, assembled in private scratch before publishing its PNG. */
export declare function createStoryboardTool(config: ResolvedFfmpegConfig, runner: ProcessRunner): FfmpegToolDefinition;
