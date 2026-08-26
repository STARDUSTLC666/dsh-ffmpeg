import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildFfmpegTools, buildProbeSummary, resolveConfig, extractArgs, frameAtArgs } from '../lib/index.js'

function makeRunner(results = []) {
  const calls = []
  return {
    calls,
    async run(argv) {
      calls.push({ argv: [...argv] })
      const preset = results.shift()
      return { exitCode: preset?.exitCode ?? 0, signal: null, stdout: preset?.stdout ?? '', stderr: preset?.stderr ?? '' }
    },
  }
}

const dir = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-frames-'))
const input = join(dir, 'movie.mp4')
writeFileSync(input, 'x')
const cfg = resolveConfig({ timeoutMs: 5000 })

const PROBE_JSON = JSON.stringify({
  format: { format_name: 'mov,mp4', duration: '90.5', size: '5242880', bit_rate: '2500000' },
  streams: [{ codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080, avg_frame_rate: '30000/1001' }],
})

test('buildProbeSummary 输出人类可读摘要', () => {
  const summary = buildProbeSummary({
    formatName: 'mov,mp4', durationSeconds: 90.5, sizeBytes: 5242880, bitrate: 2500000,
    video: { width: 1920, height: 1080, fps: 29.97, codec: 'h264', durationSeconds: 90.5, bitrate: 2400000 },
    videos: [], audio: [{}], subtitles: [],
  })
  assert.match(summary, /mov,mp4/)
  assert.match(summary, /h264 1920x1080/)
  assert.match(summary, /29\.97 fps/)
  assert.match(summary, /2\.50 Mbps/)
  assert.match(summary, /5\.0 MB/)
  assert.match(summary, /音频流 1 \/ 字幕流 0/)
})

test('ffmpeg_probe 返回 summary 且渲染包含摘要行', async () => {
  const runner = makeRunner([{ stdout: PROBE_JSON }])
  const tools = buildFfmpegTools(cfg, runner)
  const probe = tools.find((t) => t.name === 'ffmpeg_probe')
  const value = await probe.execute({ input })
  assert.match(value.summary, /h264 1920x1080/)
  const blocks = probe.output.render({}, value)
  assert.match(blocks[0].text, /摘要：/)
})

test('ffmpeg_frames every 模式：产物计数与 -frames:v 钳制', async () => {
  const outDir = join(dir, 'frames-every')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'frame-001.png'), '1')
  writeFileSync(join(outDir, 'frame-002.png'), '2')
  writeFileSync(join(outDir, 'noise.txt'), 'n')
  const runner = makeRunner()
  const frames = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_frames')
  const value = await frames.execute({ input, every: 2, outputDir: outDir })
  assert.equal(value.mode, 'every')
  assert.equal(value.count, 2)
  assert.deepEqual(value.files, ['frame-001.png', 'frame-002.png'])
  const argv = runner.calls[0].argv
  assert.ok(argv.includes('-frames:v'))
  assert.equal(argv[argv.indexOf('-frames:v') + 1], '100')
  assert.ok(argv.includes('fps=0.5'))
})

test('ffmpeg_frames times 模式：逐时间点执行且校验非法时间', async () => {
  const outDir = join(dir, 'frames-times')
  const runner = makeRunner()
  const frames = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_frames')
  const value = await frames.execute({ input, times: ['5', '00:01:30'], outputDir: outDir })
  assert.equal(value.mode, 'times')
  assert.equal(runner.calls.length, 2)
  assert.ok(runner.calls[0].argv.includes('-ss'))
  await assert.rejects(() => frames.execute({ input, times: ['x'], outputDir: outDir }), /时间点非法/)
  await assert.rejects(() => frames.execute({ input, times: new Array(21).fill('1'), outputDir: outDir }), /最多 20 个/)
})

test('ffmpeg_frames 非法 format 抛错', async () => {
  const frames = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_frames')
  await assert.rejects(() => frames.execute({ input, format: 'bmp' }), /png 或 jpg/)
})

test('extractArgs 支持 maxFrames，frameAtArgs 定点抽帧', () => {
  const argv = extractArgs('ffmpeg', { input: 'a.mp4', what: 'frames', output: 'out-%03d.png', overwrite: true, fps: 0.5, streamIndex: 0, maxFrames: 30 })
  assert.ok(argv.includes('-frames:v'))
  assert.equal(argv[argv.indexOf('-frames:v') + 1], '30')
  const at = frameAtArgs('ffmpeg', { input: 'a.mp4', time: 90, output: 'f.png', overwrite: true })
  assert.deepEqual(at.slice(at.indexOf('-ss'), at.indexOf('-ss') + 3), ['-ss', '90.000', '-i'])
  assert.ok(at.includes('-frames:v'))
})

test('清理', () => { rmSync(dir, { recursive: true, force: true }) })
