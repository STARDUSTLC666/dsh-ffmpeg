/**
 * 集成测试：真实 ffmpeg 端到端（生成→探测→剪辑→拼接→转码→抽帧→GIF）。
 * 环境没有 ffmpeg 时整组跳过（pnpm test 仍全绿）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, existsSync, statSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

const check = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' })
const hasFfmpeg = check.status === 0 || check.error === undefined && check.status !== null

/** 本机 ffmpeg 是否带指定编码器（WebM/Opus 用例按能力跳过）。 */
function hasEncoder(name) {
  if (!hasFfmpeg) return false
  const out = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout ?? ''
  return new RegExp('(^|\\s)' + name + '(\\s|$)').test(out)
}

/** 本机 ffmpeg 是否带指定滤镜（字幕烧录用例按能力跳过）。 */
function hasFilter(name) {
  if (!hasFfmpeg) return false
  const out = spawnSync('ffmpeg', ['-hide_banner', '-filters'], { encoding: 'utf8' }).stdout ?? ''
  return new RegExp('(^|\\s)' + name + '(\\s|$)').test(out)
}

const hasWebmOpus = hasEncoder('libvpx') && hasEncoder('libopus')
const hasSubtitleFilter = hasFilter('subtitles')

/** 真实 ffmpeg 短手。 */
function ffmpegRun(args) {
  return spawnSync('ffmpeg', args, { encoding: 'utf8', timeout: 120000 })
}

function stderrTail(result) {
  return String(result.stderr ?? '').slice(-500)
}

/** 每个端到端用例独立构建工具集（避免共享 runner 状态）。 */
function makeTools() {
  return buildFfmpegTools(resolveConfig({ timeoutMs: 180000, overwrite: true }), realRunner())
}

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

test('端到端：生成 → probe → cut → concat → encode（含竖屏）→ frame → gif', { skip: !hasFfmpeg }, async () => {
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

  const verticalOut = await encode.execute({ input: cutOut.output, preset: 'vertical-1080p' })
  const verticalInfo = await probe.execute({ input: verticalOut.output })
  assert.equal(verticalInfo.video.width, 1080)
  assert.equal(verticalInfo.video.height, 1920)

  const frameOut = await extract.execute({ input: source, what: 'frame', start: 1 })
  assert.ok(existsSync(frameOut.output))

  const gifOut = await gif.execute({ input: source, duration: 1, fps: 5, width: 160 })
  assert.ok(existsSync(gifOut.output))
  assert.ok(statSync(gifOut.output).size > 0)

  rmSync(dir, { recursive: true, force: true })
})

test('端到端：WebM(Opus) 提取音轨到 m4a（copy 失败自动转 AAC）', { skip: !hasFfmpeg || !hasWebmOpus }, async () => {
  const work = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-opus-'))
  try {
    const webm = join(work, 'opus.webm')
    const gen = ffmpegRun(['-y', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=15', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-c:a', 'libopus', '-b:a', '64k', '-t', '2', webm])
    assert.equal(gen.status, 0, stderrTail(gen))
    const tools = makeTools()
    const extract = tools.find((t) => t.name === 'ffmpeg_extract')
    const probe = tools.find((t) => t.name === 'ffmpeg_probe')
    const out = await extract.execute({ input: webm, what: 'audio' })
    assert.ok(existsSync(out.output), 'WebM(Opus) 提取音轨应成功')
    assert.ok(statSync(out.output).size > 0)
    const info = await probe.execute({ input: out.output })
    assert.equal(info.audio.length, 1)
    assert.equal(info.audio[0].codec, 'aac', '非 AAC 音轨应回退转码为 AAC')
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
})

test('端到端：adjust 有音轨变速 + 无音轨调音量', { skip: !hasFfmpeg }, async () => {
  const work = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-adjust-'))
  try {
    const withAudio = join(work, 'with-audio.mp4')
    const noAudio = join(work, 'no-audio.mp4')
    const genA = ffmpegRun(['-y', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=15', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-t', '1', withAudio])
    assert.equal(genA.status, 0, stderrTail(genA))
    const genB = ffmpegRun(['-y', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=15', '-t', '1', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', noAudio])
    assert.equal(genB.status, 0, stderrTail(genB))
    const tools = makeTools()
    const adjust = tools.find((t) => t.name === 'ffmpeg_adjust')
    const probe = tools.find((t) => t.name === 'ffmpeg_probe')
    const sped = await adjust.execute({ input: withAudio, speed: 2 })
    assert.ok(existsSync(sped.output))
    const spedInfo = await probe.execute({ input: sped.output })
    assert.equal(spedInfo.audio.length, 1, '有音轨输入变速后应保留音轨')
    assert.ok(spedInfo.durationSeconds < 0.9, '2 倍速后时长应明显缩短')
    const silent = await adjust.execute({ input: noAudio, volume: '0.5' })
    assert.ok(existsSync(silent.output), '无音轨输入调音量不应报错')
    const silentInfo = await probe.execute({ input: silent.output })
    assert.equal(silentInfo.audio.length, 0)
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
})

test('端到端：subtitle 烧录硬字幕', { skip: !hasFfmpeg || !hasSubtitleFilter }, async () => {
  const work = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-sub-'))
  try {
    const video = join(work, 'plain.mp4')
    const srt = join(work, 'sub.srt')
    writeFileSync(srt, '1\n00:00:00,000 --> 00:00:01,000\nhello subtitle\n', 'utf8')
    const gen = ffmpegRun(['-y', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=15', '-t', '1', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', video])
    assert.equal(gen.status, 0, stderrTail(gen))
    const tools = makeTools()
    const subtitle = tools.find((t) => t.name === 'ffmpeg_subtitle')
    const probe = tools.find((t) => t.name === 'ffmpeg_probe')
    const out = await subtitle.execute({ input: video, subtitle: srt })
    assert.ok(existsSync(out.output), '字幕烧录应产出文件')
    assert.ok(statSync(out.output).size > 0)
    const info = await probe.execute({ input: out.output })
    assert.equal(info.video.width, 160)
    assert.equal(info.video.codec, 'h264')
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
})

test('端到端：concat 重编码拼接「有音轨 + 无音轨」', { skip: !hasFfmpeg }, async () => {
  const work = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-concat-'))
  try {
    const withAudio = join(work, 'a.mp4')
    const noAudio = join(work, 'b.mp4')
    const genA = ffmpegRun(['-y', '-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=25', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-t', '2', withAudio])
    assert.equal(genA.status, 0, stderrTail(genA))
    const genB = ffmpegRun(['-y', '-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=25', '-t', '2', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', noAudio])
    assert.equal(genB.status, 0, stderrTail(genB))
    const tools = makeTools()
    const concat = tools.find((t) => t.name === 'ffmpeg_concat')
    const probe = tools.find((t) => t.name === 'ffmpeg_probe')
    const out = await concat.execute({ inputs: [withAudio, noAudio], reencode: true })
    assert.ok(existsSync(out.output), '有音轨 + 无音轨重编码拼接应成功')
    const info = await probe.execute({ input: out.output })
    assert.equal(info.video.width, 320)
    assert.equal(info.audio.length, 0, '缺音轨输入时按 a=0 纯视频拼接')
    assert.ok(info.durationSeconds >= 3.5 && info.durationSeconds <= 4.6)
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
})
