import { constants, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fmtSeconds, probeArgs } from './args.js';
import { parseTimeArg } from './config.js';
import { parseProbeJson } from './ffprobe.js';
import { assertInputFile, assertOutputNotSource, resolveOutputPath } from './paths.js';
function integer(value, fallback, min, max, name) {
    if (value === undefined)
        return fallback;
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max)
        throw new Error(name + ' 必须是 ' + min + '–' + max + ' 的整数。');
    return value;
}
function seconds(value, fallback, name) {
    if (value === undefined)
        return fallback;
    const parsed = parseTimeArg(value);
    if (parsed === null)
        throw new Error(name + ' 请使用非负秒数或 HH:MM:SS.mmm。');
    return parsed;
}
/** A bounded contact sheet, assembled in private scratch before publishing its PNG. */
export function createStoryboardTool(config, runner) {
    return {
        name: 'ffmpeg_storyboard',
        description: '把本地视频按时长均匀采样，拼成一张 PNG 总览图，返回每格序号和采样目标秒数，便于人工或视觉模型快速检查内容。默认 12 格、4 列；不代表自动镜头识别，也不保证覆盖所有短镜头。可设置 start/end 检查片段。保留源视频；默认给重名输出另取文件名。',
        parameters: {
            type: 'object', additionalProperties: false, required: ['input'], properties: {
                input: { type: 'string', description: '本地视频路径，相对当前会话工作区。' },
                output: { type: 'string', description: 'PNG 输出路径，默认源文件旁的 <文件名>-storyboard.png。' },
                count: { type: 'integer', minimum: 2, maximum: 36, description: '采样格数，2–36，默认 12。' },
                columns: { type: 'integer', minimum: 1, maximum: 6, description: '列数，1–6，默认 4；不超过采样格数。' },
                width: { type: 'integer', minimum: 160, maximum: 640, description: '每格宽度，160–640 像素，默认 320；保持比例并留黑边。' },
                start: { oneOf: [{ type: 'number' }, { type: 'string' }], description: '开始位置，秒数或 HH:MM:SS.mmm，默认 0。' },
                end: { oneOf: [{ type: 'number' }, { type: 'string' }], description: '结束位置，秒数或 HH:MM:SS.mmm，默认视频结尾。' },
            },
        },
        output: {
            schema: { type: 'object', additionalProperties: true, required: ['output', 'count', 'frames'], properties: { output: { type: 'string' }, count: { type: 'integer' }, frames: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
            render(_args, value) {
                const result = value;
                return [{ type: 'text', text: ['视频总览图：' + result.output, result.columns + ' 列 × ' + result.rows + ' 行；从左到右、从上到下。下面是采样目标时间，非逐帧时间码：', ...result.frames.map(f => '#' + f.index + '（' + f.row + ' 行 ' + f.column + ' 列）：' + f.seconds + ' 秒')].join('\n') }];
            },
        },
        async execute(raw, execution) {
            const args = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
            if (typeof args.input !== 'string' || !args.input.trim())
                throw new Error('input 请提供本地视频路径。');
            if (args.output !== undefined && (typeof args.output !== 'string' || !args.output.trim()))
                throw new Error('output 请提供 PNG 文件路径。');
            const count = integer(args.count, 12, 2, 36, 'count'), columns = Math.min(count, integer(args.columns, 4, 1, 6, 'columns'));
            const cellWidth = integer(args.width, 320, 160, 640, 'width'), cellHeight = Math.round(cellWidth * 9 / 16), rows = Math.ceil(count / columns);
            const cwd = execution?.agent?.session?.header?.cwd || process.cwd(), input = assertInputFile(args.input, cwd);
            const output = resolveOutputPath(input, args.output, '-storyboard', '.png', config.overwrite, cwd);
            if (extname(output).toLowerCase() !== '.png')
                throw new Error('视频总览图的 output 必须使用 .png 扩展名。');
            const deadline = Date.now() + config.timeoutMs, signal = execution?.signal;
            async function invoke(argv, label) {
                signal?.throwIfAborted();
                const remaining = deadline - Date.now();
                if (remaining <= 0)
                    throw new Error('视频总览图生成超时，源文件保留。');
                const result = await runner.run(argv, { timeoutMs: remaining, ...(signal ? { signal } : {}) });
                signal?.throwIfAborted();
                if (result.exitCode !== 0)
                    throw new Error(label + '失败：' + (result.stderr.trim().split(/\r?\n/).slice(-4).join(' | ') || '退出码 ' + result.exitCode));
                return result.stdout;
            }
            const info = parseProbeJson(await invoke(probeArgs(config.ffprobePath, input), '读取视频信息'));
            if (!info.video)
                throw new Error('输入文件没有视频画面，无法生成视频总览图。');
            const duration = info.video.durationSeconds ?? info.durationSeconds;
            if (duration === null || !Number.isFinite(duration) || duration <= 0)
                throw new Error('无法确定视频时长，请先用 ffmpeg_probe 检查文件。');
            const start = seconds(args.start, 0, 'start'), end = seconds(args.end, duration, 'end');
            if (start >= end || end > duration)
                throw new Error('采样范围必须满足 0 ≤ start < end ≤ 视频时长（' + duration + ' 秒）。');
            const lastFrame = info.video.fps && info.video.fps > 0 ? Math.max(0, duration - 1 / info.video.fps) : duration;
            if (start > lastFrame)
                throw new Error('所选范围太靠近结尾，无法取得视频帧；请提前 start。');
            const frames = Array.from({ length: count }, (_, i) => ({ index: i + 1, row: Math.floor(i / columns) + 1, column: i % columns + 1, seconds: Number(fmtSeconds(Math.min(lastFrame, start + (end - start) * i / count))) }));
            const scratch = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-storyboard-'));
            try {
                for (const frame of frames) {
                    const image = join(scratch, 'frame-' + String(frame.index).padStart(3, '0') + '.png');
                    const filter = 'scale=' + cellWidth + ':' + cellHeight + ':force_original_aspect_ratio=decrease,pad=' + cellWidth + ':' + cellHeight + ':(ow-iw)/2:(oh-ih)/2:color=black,setsar=1';
                    await invoke([config.ffmpegPath, '-nostdin', '-v', 'error', '-n', '-ss', fmtSeconds(frame.seconds), '-i', input, '-map', '0:v:0', '-frames:v', '1', '-an', '-vf', filter, '-update', '1', image], '采样 #' + frame.index);
                    if (!existsSync(image) || !lstatSync(image).isFile() || lstatSync(image).size === 0)
                        throw new Error('无法取得第 ' + frame.index + ' 格（' + frame.seconds + ' 秒）的画面，请缩短采样范围后重试。');
                }
                const assembled = join(scratch, 'storyboard.png');
                await invoke([config.ffmpegPath, '-nostdin', '-v', 'error', '-n', '-framerate', '1', '-start_number', '1', '-i', join(scratch, 'frame-%03d.png'), '-vf', 'tile=' + columns + 'x' + rows + ':nb_frames=' + count + ':padding=8:margin=8:color=black', '-frames:v', '1', '-update', '1', assembled], '拼接视频总览图');
                if (!existsSync(assembled) || !lstatSync(assembled).isFile() || lstatSync(assembled).size === 0)
                    throw new Error('视频总览图未生成，输出文件保留。');
                signal?.throwIfAborted();
                assertOutputNotSource([input], output, cwd);
                mkdirSync(dirname(output), { recursive: true });
                copyFileSync(assembled, output, config.overwrite ? 0 : constants.COPYFILE_EXCL);
                return { output, input, count, columns, rows, cellWidth, cellHeight, width: columns * cellWidth + (columns - 1) * 8 + 16, height: rows * cellHeight + (rows - 1) * 8 + 16, start, end, durationSeconds: duration, timestampKind: 'requested-seek-time', frames };
            }
            finally {
                rmSync(scratch, { recursive: true, force: true });
            }
        },
        timeoutMs: config.timeoutMs,
    };
}
