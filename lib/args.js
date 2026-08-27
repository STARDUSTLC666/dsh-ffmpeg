/**
 * ffmpeg/ffprobe 命令行构建器：纯函数，输入业务参数输出完整 argv 数组（argv[0] 为程序）。
 * 所有参数以独立数组元素传递，绝不经过 shell 解释——用户输入无法注入命令。
 *
 * @module dsh-ffmpeg/args
 */
/** 秒数格式化为 ffmpeg 友好的定点字符串。 */
export function fmtSeconds(seconds) {
    return seconds.toFixed(3);
}
/** 覆写标志：不覆写用 -n（目标存在即报错，双保险），覆写用 -y。 */
function overwriteFlag(overwrite) {
    return overwrite ? '-y' : '-n';
}
/** 转义 filter 路径（Windows 冒号与反斜杠、单引号）。 */
export function escapeFilterPath(path) {
    return path.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}
/** ffprobe 探测命令。 */
export function probeArgs(ffprobe, input) {
    return [ffprobe, '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', input];
}
/** 剪辑：流拷贝（快、关键帧对齐）或重编码（精确到帧）。 */
export function cutArgs(ffmpeg, spec) {
    const flag = overwriteFlag(spec.overwrite);
    if (!spec.reencode) {
        return [ffmpeg, flag, '-ss', fmtSeconds(spec.start), '-i', spec.input, '-t', fmtSeconds(spec.duration), '-c', 'copy', '-avoid_negative_ts', 'make_zero', spec.output];
    }
    return [ffmpeg, flag, '-i', spec.input, '-ss', fmtSeconds(spec.start), '-t', fmtSeconds(spec.duration), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', spec.output];
}
/** 拼接：同编码流拷贝走 concat demuxer（需 list 文件），否则 filter_complex 重编码。 */
export function concatArgs(ffmpeg, spec) {
    const flag = overwriteFlag(spec.overwrite);
    if (!spec.reencode) {
        return [ffmpeg, flag, '-f', 'concat', '-safe', '0', '-i', spec.listFilePath ?? '', '-c', 'copy', spec.output];
    }
    const parts = [ffmpeg, flag];
    for (const input of spec.inputs)
        parts.push('-i', input);
    parts.push('-filter_complex', 'concat=n=' + spec.inputs.length + ':v=1:a=1', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', spec.output);
    return parts;
}
/** concat demuxer 的 list 文件内容（路径中的单引号按 ffmpeg 规则转义）。 */
export function concatListContent(inputs) {
    return inputs.map((input) => "file '" + input.replace(/\\/g, '/').replace(/'/g, "'\\''") + "'").join('\n') + '\n';
}
export const ENCODE_PRESETS = ['bilibili-1080p', 'bilibili-4k', 'vertical-1080p', 'web-720p'];
const PRESET_TABLE = {
    'bilibili-1080p': { crf: 20, maxrate: '6000k', bufsize: '12000k' },
    'bilibili-4k': { crf: 18, maxrate: '20000k', bufsize: '40000k' },
    'vertical-1080p': { crf: 20, maxrate: '6000k', bufsize: '12000k', vf: 'scale=-2:1920' },
    'web-720p': { crf: 23, maxrate: '2800k', bufsize: '5600k', vf: 'scale=-2:720' },
};
/** 转码：预设 + 可选的 crf/fps/scale 覆盖。 */
export function encodeArgs(ffmpeg, spec) {
    const preset = PRESET_TABLE[spec.preset];
    const crf = spec.crf ?? preset.crf;
    const parts = [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input];
    const vf = spec.scale !== undefined && spec.scale !== '' ? 'scale=' + spec.scale : preset.vf;
    if (vf !== undefined && vf !== '')
        parts.push('-vf', vf);
    if (spec.fps !== undefined)
        parts.push('-r', String(spec.fps));
    parts.push('-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-maxrate', preset.maxrate, '-bufsize', preset.bufsize, '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', spec.output);
    return parts;
}
/** 字幕烧录（subtitles filter，路径转义）。 */
export function subtitleArgs(ffmpeg, spec) {
    const filter = "subtitles='" + escapeFilterPath(spec.subtitle) + "'";
    return [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input, '-vf', filter, '-c:a', 'copy', spec.output];
}
/** 提取：音频（拷贝）/ 抽帧序列 / 单帧 / 字幕流。 */
export function extractArgs(ffmpeg, spec) {
    const flag = overwriteFlag(spec.overwrite);
    if (spec.what === 'audio') {
        return [ffmpeg, flag, '-i', spec.input, '-vn', '-c', 'copy', spec.output];
    }
    if (spec.what === 'subtitle') {
        return [ffmpeg, flag, '-i', spec.input, '-map', '0:s:' + spec.streamIndex, '-c', 'copy', spec.output];
    }
    if (spec.what === 'frame') {
        const parts = [ffmpeg, flag, '-i', spec.input];
        if (spec.start !== undefined)
            parts.push('-ss', fmtSeconds(spec.start));
        parts.push('-frames:v', '1', spec.output);
        return parts;
    }
    // frames 序列
    const parts = [ffmpeg, flag, '-i', spec.input];
    if (spec.start !== undefined)
        parts.push('-ss', fmtSeconds(spec.start));
    if (spec.duration !== undefined)
        parts.push('-t', fmtSeconds(spec.duration));
    if (spec.maxFrames !== undefined)
        parts.push('-frames:v', String(spec.maxFrames));
    parts.push('-vf', 'fps=' + (spec.fps ?? 1), spec.output);
    return parts;
}
/** 定点抽帧：在指定时间点取一帧。 */
export function frameAtArgs(ffmpeg, spec) {
    const flag = overwriteFlag(spec.overwrite);
    return [ffmpeg, flag, '-ss', fmtSeconds(spec.time), '-i', spec.input, '-frames:v', '1', spec.output];
}
/** GIF 第一遍：调色板生成（palettegen）。 */
export function gifPaletteArgs(ffmpeg, spec) {
    const filter = 'fps=' + spec.fps + ',scale=' + spec.width + ':-1:flags=lanczos,palettegen';
    return [ffmpeg, '-y', '-i', spec.input, '-ss', fmtSeconds(spec.start), '-t', fmtSeconds(spec.duration), '-vf', filter, spec.palettePath];
}
/** GIF 第二遍：paletteuse 合成。 */
export function gifUseArgs(ffmpeg, spec) {
    const filter = 'fps=' + spec.fps + ',scale=' + spec.width + ':-1:flags=lanczos[x];[x][1:v]paletteuse';
    return [ffmpeg, overwriteFlag(spec.overwrite), '-i', spec.input, '-ss', fmtSeconds(spec.start), '-t', fmtSeconds(spec.duration), '-i', spec.palettePath, '-filter_complex', filter, spec.output];
}
