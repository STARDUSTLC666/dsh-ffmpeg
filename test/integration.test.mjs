/**
 * 集成测试：真实 ffmpeg 端到端（生成→探测→剪辑→拼接→转码→抽帧→GIF）。
 * 环境没有 ffmpeg 时整组跳过（pnpm test 仍全绿）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, existsSync, statSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

const check = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' })
const hasFfmpeg = check.status === 0 || check.error === undefined && check.status !== null

/** 真实 runner：用本机 ffmpeg 跑 argv（测试专用，不发布）。 */
function realRunner() {
  return {
    async run(argv, options) {
      const result = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', timeout: options?.timeoutMs ?? 120000 })
      return { exitCode: result.status ?? null, signal: result.signal ?? null, stdout: result.stdout ?? '', stderr: result.stderr ?? '' }
    },
  }
}

const dir = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-int-'))
const source = join(dir, 'source.mp4')

test('环境检查：ffmpeg 可用', { skip: !hasFfmpeg }, () => {
  assert.ok(true)
})

test('端到端：生成 → probe → cut → concat → encode → frame → gif', { skip: !hasFfmpeg }, async () => {
  // 生成 3 秒测试视频（testsrc + sine 音频）
  const gen = spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=25', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3', '-c:v', 'libx264', '-c:a', 'aac', '-t', '3', source], { encoding: 'utf8', timeout: 120000 })
  assert.equal(gen.status, 0, gen.stderr.slice(-500))
  assert.ok(existsSync(source))

  const tools = buildFfmpegTools(resolveConfig({ timeoutMs: 180000, overwrite: true }), realRunner())
  const probe = tools.find((t) => t.name === 'ffmpeg_probe')
  const cut = tools.find((t) => t.name === 'ffmpeg_cut')
  const concat = tools.find((t) => t.name === 'ffmpeg_concat')
  const encode = tools.find((t) => t.name === 'ffmpeg_encode')
  const extract = tools.find((t) => t.name === 'ffmpeg_extract')
  const gif = tools.find((t) => t.name === 'ffmpeg_gif')

  const info = await probe.execute({ input: source })
  assert.equal(info.ok, true)
  assert.equal(info.video.width, 320)
  assert.ok(info.durationSeconds >= 2.9 && info.durationSeconds <= 3.2)
  assert.equal(info.audio.length, 1)

  const cutOut = await cut.execute({ input: source, start: 1, duration: 1 })
  assert.ok(existsSync(cutOut.output))
  assert.ok(statSync(cutOut.output).size > 0)

  const concatOut = await concat.execute({ inputs: [cutOut.output, cutOut.output] })
  assert.ok(existsSync(concatOut.output))

  const encodeOut = await encode.execute({ input: source, preset: 'web-720p' })
  assert.ok(existsSync(encodeOut.output))
  const encodedInfo = await probe.execute({ input: encodeOut.output })
  assert.equal(encodedInfo.video.codec, 'h264')
  assert.equal(encodedInfo.video.height, 720)

  const frameOut = await extract.execute({ input: source, what: 'frame', start: 1 })
  assert.ok(existsSync(frameOut.output))

  const gifOut = await gif.execute({ input: source, duration: 1, fps: 5, width: 160 })
  assert.ok(existsSync(gifOut.output))
  assert.ok(statSync(gifOut.output).size > 0)

  rmSync(dir, { recursive: true, force: true })
})
