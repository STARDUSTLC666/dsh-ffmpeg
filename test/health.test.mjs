import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

function makeRunner(map = {}) {
  return {
    async run(argv) {
      const preset = map[argv[1]] ?? { exitCode: 0, stdout: argv[0] + ' version 6.0', stderr: '' }
      return { exitCode: preset.exitCode ?? 0, signal: null, stdout: preset.stdout ?? '', stderr: preset.stderr ?? '' }
    },
  }
}

const cfg = resolveConfig({ timeoutMs: 5000 })

test('ffmpeg_health 两个二进制可用时 ok=true', async () => {
  const health = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_health')
  const value = await health.execute({})
  assert.equal(value.ok, true)
  assert.equal(value.checks.length, 2)
  const blocks = health.output.render({}, value)
  assert.match(blocks[0].text, /自检：正常/)
})

test('ffmpeg_health 二进制失败时报错因', async () => {
  const runner = { async run(argv) { if (argv[0].includes('probe')) throw new Error('ENOENT'); return { exitCode: 0, signal: null, stdout: 'ffmpeg version 6.0', stderr: '' } } }
  const health = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_health')
  const value = await health.execute({})
  assert.equal(value.ok, false)
  const bad = value.checks.find((c) => c.ok === false)
  assert.match(String(bad.detail), /ENOENT/)
})
