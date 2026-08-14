import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  probeArgs, cutArgs, concatArgs, concatListContent, encodeArgs, subtitleArgs, extractArgs,
  gifPaletteArgs, gifUseArgs, fmtSeconds, escapeFilterPath, ENCODE_PRESETS,
} from '../lib/index.js'

test('probeArgs 生成 ffprobe JSON 探测命令', () => {
  assert.deepEqual(probeArgs('ffprobe', 'in.mp4'), [
    'ffprobe', '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', 'in.mp4',
  ])
})

test('cutArgs 流拷贝模式：-ss 在 -i 前 + -c copy + 防覆写 -n', () => {
  const argv = cutArgs('ffmpeg', { input: 'in.mp4', start: 1.5, duration: 10, output: 'out.mp4', overwrite: false, reencode: false })
  assert.deepEqual(argv, ['ffmpeg', '-n', '-ss', '1.500', '-i', 'in.mp4', '-t', '10.000', '-c', 'copy', '-avoid_negative_ts', 'make_zero', 'out.mp4'])
})

test('cutArgs 重编码模式：-ss 在 -i 后 + x264/aac + -y', () => {
  const argv = cutArgs('ffmpeg', { input: 'in.mp4', start: 0, duration: 5, output: 'out.mp4', overwrite: true, reencode: true })
  assert.equal(argv[1], '-y')
  assert.equal(argv[2], '-i')
  assert.ok(argv.includes('-c:v') && argv.includes('libx264') && argv.includes('-c:a') && argv.includes('aac'))
})

test('concatArgs 流拷贝走 concat demuxer + list 文件', () => {
  const argv = concatArgs('ffmpeg', { inputs: ['a.mp4', 'b.mp4'], listFilePath: 'list.txt', output: 'out.mp4', overwrite: false, reencode: false })
  assert.deepEqual(argv, ['ffmpeg', '-n', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'out.mp4'])
})

test('concatArgs 重编码用 filter_complex', () => {
  const argv = concatArgs('ffmpeg', { inputs: ['a.mp4', 'b.mp4', 'c.mp4'], output: 'out.mp4', overwrite: true, reencode: true })
  assert.equal(argv[1], '-y')
  assert.deepEqual(argv.slice(2, 8), ['-i', 'a.mp4', '-i', 'b.mp4', '-i', 'c.mp4'])
  assert.ok(argv.includes('concat=n=3:v=1:a=1'))
})

test('concatListContent 转义反斜杠与单引号', () => {
  const content = concatListContent(['C:\\vids\\a b.mp4', "C:\\vids\\it's.mp4"])
  assert.equal(content, "file 'C:/vids/a b.mp4'\nfile 'C:/vids/it'\\''s.mp4'\n")
})

test('encodeArgs bilibili-1080p 预设默认参数', () => {
  const argv = encodeArgs('ffmpeg', { input: 'in.mp4', output: 'out.mp4', preset: 'bilibili-1080p', overwrite: false })
  assert.deepEqual(argv[0], 'ffmpeg')
  assert.ok(argv.includes('-maxrate') && argv.includes('6000k'))
  assert.ok(argv.includes('-crf') && argv.includes('20'))
  assert.ok(argv.includes('yuv420p') && argv.includes('+faststart'))
})

test('encodeArgs vertical-1080p 带 scale 滤镜；crf/fps 覆盖生效', () => {
  const argv = encodeArgs('ffmpeg', { input: 'in.mp4', output: 'out.mp4', preset: 'vertical-1080p', crf: 26, fps: 30, scale: '1080:1920', overwrite: true })
  assert.ok(argv.includes('scale=1080:1920'))
  assert.ok(argv.includes('-crf') && argv.includes('26'))
  assert.ok(argv.includes('-r') && argv.includes('30'))
})

test('ENCODE_PRESETS 枚举完整', () => {
  assert.deepEqual(ENCODE_PRESETS, ['bilibili-1080p', 'bilibili-4k', 'vertical-1080p', 'web-720p'])
})

test('subtitleArgs 烧录 filter 带 Windows 路径转义', () => {
  const argv = subtitleArgs('ffmpeg', { input: 'in.mp4', subtitle: 'C:\\subs\\中文字幕.srt', output: 'out.mp4', overwrite: false })
  assert.ok(argv.includes('-vf'))
  const filter = argv[argv.indexOf('-vf') + 1]
  assert.equal(filter, "subtitles='C\\:/subs/中文字幕.srt'")
})

test('extractArgs audio 流拷贝 / subtitle 映射 / 单帧 / 抽帧', () => {
  assert.deepEqual(extractArgs('ffmpeg', { input: 'in.mp4', what: 'audio', output: 'a.m4a', overwrite: false, streamIndex: 0 }),
    ['ffmpeg', '-n', '-i', 'in.mp4', '-vn', '-c', 'copy', 'a.m4a'])
  assert.deepEqual(extractArgs('ffmpeg', { input: 'in.mp4', what: 'subtitle', output: 's.srt', overwrite: false, streamIndex: 1 }),
    ['ffmpeg', '-n', '-i', 'in.mp4', '-map', '0:s:1', '-c', 'copy', 's.srt'])
  assert.deepEqual(extractArgs('ffmpeg', { input: 'in.mp4', what: 'frame', output: 'f.png', overwrite: false, streamIndex: 0, start: 3 }),
    ['ffmpeg', '-n', '-i', 'in.mp4', '-ss', '3.000', '-frames:v', '1', 'f.png'])
  const frames = extractArgs('ffmpeg', { input: 'in.mp4', what: 'frames', output: 'seq-%03d.png', overwrite: false, streamIndex: 0, fps: 2, duration: 4 })
  assert.ok(frames.includes('fps=2'))
  assert.ok(frames.includes('-t') && frames.includes('4.000'))
})

test('gif 两遍：palettegen 强制 -y，paletteuse 遵覆写策略', () => {
  const spec = { input: 'in.mp4', output: 'out.gif', palettePath: 'out.gif.palette.png', overwrite: false, start: 1, duration: 3, fps: 10, width: 480 }
  const pass1 = gifPaletteArgs('ffmpeg', spec)
  assert.equal(pass1[1], '-y')
  assert.ok(pass1.some((part) => part.includes('palettegen')))
  const pass2 = gifUseArgs('ffmpeg', spec)
  assert.equal(pass2[1], '-n')
  assert.ok(pass2.some((part) => part.includes('paletteuse')))
})

test('fmtSeconds 与 escapeFilterPath', () => {
  assert.equal(fmtSeconds(1.234567), '1.235')
  assert.equal(escapeFilterPath('C:\\a\\b.srt'), 'C\\:/a/b.srt')
})
