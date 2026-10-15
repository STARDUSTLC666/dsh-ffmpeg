import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

const available = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0
function run(program, args) {
  const result = spawnSync(program, args, { encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024 })
  assert.equal(result.status, 0, String(result.stderr).slice(-2500))
  return result.stdout
}
function source(file, { size = '160x96', fps = 16, seconds = 2, audio = true, sar = '1' } = {}) {
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `testsrc2=size=${size}:rate=${fps}`]
  if (audio) args.push('-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100')
  args.push('-t', String(seconds), '-vf', 'setsar=' + sar, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p')
  if (audio) args.push('-c:a', 'aac')
  run('ffmpeg', [...args, file])
}
function tools() {
  const runner = { async run(argv) {
    const result = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024 })
    return { exitCode: result.status ?? -1, stdout: result.stdout ?? '', stderr: result.stderr ?? String(result.error ?? ''), signal: result.signal }
  } }
  return Object.fromEntries(buildFfmpegTools(resolveConfig({ overwrite: true, timeoutMs: 45000 }), runner).map(t => [t.name, t]))
}
function probe(file) {
  return JSON.parse(run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]))
}
function scratch(t) {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-regression-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

test('real GIF honours a nonzero start and exact clip duration (#4)', { skip: !available }, async t => {
  const dir = scratch(t), input = join(dir, 'six seconds.mp4'), output = join(dir, 'clip.gif')
  source(input, { seconds: 6 })
  await tools().ffmpeg_gif.execute({ input, output, start: 1, duration: 3, fps: 8, width: 128 })
  const info = probe(output), video = info.streams.find(s => s.codec_type === 'video')
  assert.equal(Number(video.nb_read_frames), 24)
  assert.equal(video.width, 128)
  assert.ok(Math.abs(Number(info.format.duration) - 3) < 0.1)
})

test('real concat normalizes different dimensions, fps and SAR (#5)', { skip: !available }, async t => {
  const dir = scratch(t), a = join(dir, 'a.mp4'), b = join(dir, 'b.mp4'), output = join(dir, 'joined.mp4')
  source(a, { fps: 12, seconds: 1 })
  source(b, { size: '120x90', fps: 25, sar: '4/3', seconds: 1 })
  const result = await tools().ffmpeg_concat.execute({ inputs: [a, b], output, reencode: true })
  const info = probe(output), video = info.streams.find(s => s.codec_type === 'video')
  assert.equal(video.width, 160)
  assert.equal(video.height, 96)
  assert.equal(video.sample_aspect_ratio, '1:1')
  assert.equal(video.avg_frame_rate, '12/1')
  assert.ok(Math.abs(Number(info.format.duration) - 2) < 0.2)
  assert.ok(info.streams.some(s => s.codec_type === 'audio'))
  assert.deepEqual(result.normalized, { width: 160, height: 96, fps: 12 })
})

test('mixed sound/silent concat retains sound and fills only the silent segment', { skip: !available }, async t => {
  const dir = scratch(t), a = join(dir, 'sound.mp4'), b = join(dir, 'silent.mp4'), output = join(dir, 'joined.mp4')
  source(a, { seconds: 1 })
  source(b, { size: '120x90', audio: false, seconds: 1 })
  await tools().ffmpeg_concat.execute({ inputs: [a, b], output, reencode: true })
  const info = probe(output)
  assert.ok(info.streams.some(s => s.codec_type === 'audio'), 'one silent input must not mute the entire output')
  function maximum(start) {
    const result = spawnSync('ffmpeg', ['-hide_banner', '-ss', String(start), '-i', output, '-t', '0.3', '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8', timeout: 15000 })
    assert.equal(result.status, 0, result.stderr)
    const match = result.stderr.match(/max_volume: (-?[\d.]+) dB/)
    assert.ok(match, result.stderr)
    return Number(match[1])
  }
  assert.ok(maximum(0.2) > -40, 'first segment must retain its sine wave')
  assert.ok(maximum(1.5) < -60, 'second segment should contain silence')
})

test('concat can explicitly choose output size/fps without stretching inputs', { skip: !available }, async t => {
  const dir = scratch(t), a = join(dir, 'a.mp4'), b = join(dir, 'b.mp4'), output = join(dir, 'portrait.mp4')
  source(a, { audio: false, seconds: 0.5 })
  source(b, { size: '96x160', audio: false, seconds: 0.5 })
  await tools().ffmpeg_concat.execute({ inputs: [a, b], output, reencode: true, width: 96, height: 160, fps: 10 })
  const video = probe(output).streams.find(s => s.codec_type === 'video')
  assert.equal(video.width, 96)
  assert.equal(video.height, 160)
  assert.equal(video.avg_frame_rate, '10/1')
})
