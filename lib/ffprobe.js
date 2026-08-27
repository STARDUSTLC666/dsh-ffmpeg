/**
 * ffprobe JSON 输出解析：格式信息 + 视频/音频/字幕流归一化。
 *
 * @module dsh-ffmpeg/ffprobe
 */
function num(value) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'string' && value.trim() !== '' && value.trim().toLowerCase() !== 'n/a') {
        const parsed = Number(value);
        if (Number.isFinite(parsed))
            return parsed;
    }
    return null;
}
function str(value) {
    return typeof value === 'string' ? value : '';
}
/**
 * 解析帧率字符串（如 30000/1001）为浮点；失败返回 null。
 */
function parseFps(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0)
        return value;
    if (typeof value === 'string') {
        const parts = value.split('/');
        if (parts.length === 2) {
            const top = Number(parts[0]);
            const bottom = Number(parts[1]);
            if (Number.isFinite(top) && Number.isFinite(bottom) && bottom !== 0)
                return top / bottom;
        }
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0)
            return parsed;
    }
    return null;
}
/**
 * 解析 ffprobe -print_format json 输出。
 * @param text - ffprobe 的 stdout。
 * @throws 输出不是合法 JSON 时抛中文错误。
 */
export function parseProbeJson(text) {
    let raw;
    try {
        raw = JSON.parse(text);
    }
    catch (error) {
        throw new Error('ffprobe 输出解析失败：' + (error instanceof Error ? error.message : String(error)));
    }
    const root = (typeof raw === 'object' && raw !== null ? raw : {});
    const format = (typeof root.format === 'object' && root.format !== null ? root.format : {});
    const streams = Array.isArray(root.streams) ? root.streams : [];
    const videos = [];
    const audio = [];
    const subtitles = [];
    for (const stream of streams) {
        const codecType = str(stream.codec_type);
        if (codecType === 'video') {
            videos.push({
                width: num(stream.width) ?? 0,
                height: num(stream.height) ?? 0,
                fps: parseFps(stream.avg_frame_rate) ?? parseFps(stream.r_frame_rate),
                codec: str(stream.codec_name),
                durationSeconds: num(stream.duration) ?? null,
                bitrate: num(stream.bit_rate) ?? null,
            });
        }
        else if (codecType === 'audio') {
            audio.push({
                codec: str(stream.codec_name),
                sampleRate: num(stream.sample_rate) ?? null,
                channels: num(stream.channels) ?? null,
                durationSeconds: num(stream.duration) ?? null,
            });
        }
        else if (codecType === 'subtitle') {
            const tags = (typeof stream.tags === 'object' && stream.tags !== null ? stream.tags : {});
            subtitles.push({
                codec: str(stream.codec_name),
                language: typeof tags.language === 'string' ? tags.language : null,
            });
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
    };
}
