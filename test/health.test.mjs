import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

const packageFile = fileURLToPath(new URL('../package.json', import.meta.url))

function makeRunner(map = {}) {
  return {
    async run(argv) {
      const preset = map[argv[1]] ?? { exitCode: 0, stdout: argv[0] + ' version 6.0', stderr: '' }
      return { exitCode: preset.exitCode ?? 0, signal: null, stdout: preset.stdout ?? '', stderr: preset.stderr ?? '' }
    },
  }
}

const cfg = resolveConfig({ timeoutMs: 10000 })

test('ffmpeg_health 两个二进制可用时 ok=true', async () => {
  const health = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_health')
  const value = await health.execute({})
  assert.equal(value.ok, true)
  assert.equal(value.checks.length, 2)
  const blocks = health.output.render({}, value)
  assert.match(blocks[0].text, /自检：正常/)
})

test('ffmpeg_health 失败时给出可执行的下一步与环境变量名', async () => {
  const runner = { async run(argv) { throw new Error('spawn ' + argv[0] + ' ENOENT') } }
  const health = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_health')
  const value = await health.execute({})
  assert.equal(value.ok, false)
  assert.match(String(value.hint), /ffmpegPath/)
  const text = health.output.render({}, value)[0].text
  assert.match(text, /下一步/)
  assert.match(text, /DSH_FFMPEG_PATH/)
  assert.match(text, /ENOENT/, '原始原因保留，便于定位')
  assert.doesNotMatch(text, /- ffmpeg（ffmpeg）/, '路径与命令名相同时不重复')
})

test('找不到可执行文件时工具报错点名 ffmpeg_health 与修复路径，其他错误不被改写', async () => {
  const missing = buildFfmpegTools(cfg, { async run(argv) { throw new Error('spawn ' + argv[0] + ' ENOENT') } }).find((t) => t.name === 'ffmpeg_cut')
  await assert.rejects(() => missing.execute({ input: packageFile, start: 0, end: 1 }), /ffmpeg_health/)
  const denied = buildFfmpegTools(cfg, { async run() { throw new Error('EACCES: permission denied') } }).find((t) => t.name === 'ffmpeg_cut')
  await assert.rejects(() => denied.execute({ input: packageFile, start: 0, end: 1 }), (error) => {
    assert.match(error.message, /EACCES/)
    assert.doesNotMatch(error.message, /ffmpeg_health/)
    return true
  })
})

test('ffmpeg_health 二进制失败时报错因', async () => {
  const runner = { async run(argv) { if (argv[0].includes('probe')) throw new Error('ENOENT'); return { exitCode: 0, signal: null, stdout: 'ffmpeg version 6.0', stderr: '' } } }
  const health = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_health')
  const value = await health.execute({})
  assert.equal(value.ok, false)
  const bad = value.checks.find((c) => c.ok === false)
  assert.match(String(bad.detail), /ENOENT/)
})
