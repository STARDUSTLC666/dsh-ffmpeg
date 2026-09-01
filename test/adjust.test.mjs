import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { adjustArgs, atempoChain, rotateFilter, buildFfmpegTools, resolveConfig } from '../lib/index.js'

const dir = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-adjust-'))
const input = join(dir, 'in.mp4')
writeFileSync(input, 'fake')
const output = join(dir, 'out.mp4')

function makeRunner() {
  return { run: async () => ({ exitCode: 0, stdout: '', stderr: '' }) }
}

const cfg = resolveConfig({ timeoutMs: 120000 })

test('atempoChain：常规倍速单滤镜，低于 0.5 级联', () => {
  assert.equal(atempoChain(2), 'atempo=2')
  assert.equal(atempoChain(1.5), 'atempo=1.5')
  assert.equal(atempoChain(0.5), 'atempo=0.5')
  assert.equal(atempoChain(0.25), 'atempo=0.5,atempo=0.5')
  assert.equal(atempoChain(0.1), 'atempo=0.5,atempo=0.5,atempo=0.5,atempo=0.8')
})

test('rotateFilter：90/270 transpose，180 双翻转', () => {
  assert.equal(rotateFilter(90), 'transpose=1')
  assert.equal(rotateFilter(270), 'transpose=2')
  assert.equal(rotateFilter(180), 'hflip,vflip')
})

test('adjustArgs 仅静音：视频流拷贝 + -an，无滤镜', () => {
  const argv = adjustArgs('ffmpeg', { input, output, overwrite: true, mute: true, hasAudio: true })
  assert.ok(argv.includes('-c:v') && argv[argv.indexOf('-c:v') + 1] === 'copy')
  assert.ok(argv.includes('-an'))
  assert.ok(!argv.includes('-vf') && !argv.includes('-af'))
})

test('adjustArgs 仅音量（有音轨）：视频流拷贝 + volume 滤镜 + aac', () => {
  const argv = adjustArgs('ffmpeg', { input, output, overwrite: true, volume: '-3dB', hasAudio: true })
  assert.ok(argv[argv.indexOf('-c:v') + 1] === 'copy')
  assert.ok(argv[argv.indexOf('-af') + 1] === 'volume=-3dB')
  assert.ok(argv[argv.indexOf('-c:a') + 1] === 'aac')
})

test('adjustArgs 变速：视频重编码 + setpts/atempo 成对', () => {
  const argv = adjustArgs('ffmpeg', { input, output, overwrite: true, speed: 2, hasAudio: true })
  assert.ok(argv[argv.indexOf('-vf') + 1] === 'setpts=PTS/2')
  assert.ok(argv[argv.indexOf('-af') + 1] === 'atempo=2')
  assert.ok(argv[argv.indexOf('-c:v') + 1] === 'libx264')
})

test('adjustArgs 变速但无音轨：只动视频，输出静音 -an', () => {
  const argv = adjustArgs('ffmpeg', { input, output, overwrite: true, speed: 4, hasAudio: false })
  assert.ok(argv[argv.indexOf('-vf') + 1] === 'setpts=PTS/4')
  assert.ok(!argv.includes('-af'))
  assert.ok(argv.includes('-an'))
})

test('adjustArgs 旋转 90：重编码 + transpose', () => {
  const argv = adjustArgs('ffmpeg', { input, output, overwrite: true, rotate: 90, hasAudio: true })
  assert.ok(argv[argv.indexOf('-vf') + 1] === 'transpose=1')
  assert.ok(argv[argv.indexOf('-c:v') + 1] === 'libx264')
  assert.ok(argv[argv.indexOf('-c:a') + 1] === 'copy')
})

test('adjustArgs 组合（变速+音量+旋转）：滤镜链顺序拼接', () => {
  const argv = adjustArgs('ffmpeg', { input, output, overwrite: false, speed: 1.5, volume: '1.2', rotate: 270, hasAudio: true })
  assert.ok(argv[argv.indexOf('-vf') + 1] === 'setpts=PTS/1.5,transpose=2')
  assert.ok(argv[argv.indexOf('-af') + 1] === 'atempo=1.5,volume=1.2')
  assert.ok(argv.includes('-n'))
})

test('ffmpeg_adjust 参数校验：无操作/非法 speed/非法 volume/非法 rotate', async () => {
  const adjust = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_adjust')
  await assert.rejects(() => adjust.execute({ input }), /至少提供一个/)
  await assert.rejects(() => adjust.execute({ input, speed: 0.01 }), /0\.1-100/)
  await assert.rejects(() => adjust.execute({ input, speed: 101 }), /0\.1-100/)
  await assert.rejects(() => adjust.execute({ input, volume: 'loud' }), /倍数.*分贝|分贝.*倍数/)
  await assert.rejects(() => adjust.execute({ input, rotate: 45 }), /90 \/ 180 \/ 270/)
  await assert.rejects(() => adjust.execute({ input: join(dir, 'missing.mp4'), mute: true }), /不存在|找到/)
})

test('ffmpeg_adjust 走 probe 判断音轨并执行（有音轨路径）', async () => {
  const calls = []
  const runner = {
    run: async (argv) => {
      calls.push(argv)
      if (String(argv[0]).includes('ffprobe') || argv.includes('-show_streams')) {
        return { exitCode: 0, stdout: JSON.stringify({ format: { format_name: 'mp4' }, streams: [{ codec_type: 'video' }, { codec_type: 'audio' }] }), stderr: '' }
      }
      return { exitCode: 0, stdout: '', stderr: '' }
    },
  }
  const adjust = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_adjust')
  const result = await adjust.execute({ input, mute: true, output })
  assert.equal(result.hasAudio, true)
  assert.deepEqual(result.ops, ['静音'])
  const ffmpegCall = calls.find((argv) => !argv.includes('-show_streams'))
  assert.ok(ffmpegCall.includes('-an'))
})

test('ffmpeg_adjust render 输出人类可读摘要', () => {
  const adjust = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_adjust')
  const blocks = adjust.output.render({}, { output: 'x.mp4', ops: ['倍速 x2', '静音'] })
  assert.match(blocks[0].text, /调整完成：x\.mp4（倍速 x2，静音）/)
})

test('after all', () => rmSync(dir, { recursive: true, force: true }))
