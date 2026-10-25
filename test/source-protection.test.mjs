import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, linkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { buildFfmpegTools, resolveConfig, resolveOutputPath } from '../lib/index.js'

function fixture(t, overwrite = false) {
  const root = mkdtempSync(path.join(tmpdir(), 'dsh-ffmpeg-issue6-'))
  t.after(() => { assert.ok(path.basename(root).startsWith('dsh-ffmpeg-issue6-')); rmSync(root, { recursive: true, force: true }) })
  const a = path.join(root, 'clip.mp4'), b = path.join(root, 'other.mp4'), subtitle = path.join(root, 'subtitle.srt')
  for (const file of [a, b, subtitle]) writeFileSync(file, 'keep original')
  const calls = []
  const runner = { async run(argv) {
    calls.push(argv)
    const output = argv.at(-1)
    if (/%(?:0\d+)?d/.test(output)) writeFileSync(output.replace(/%(?:0\d+)?d/, '001'), 'new frame')
    return { exitCode: 0, signal: null, stdout: '', stderr: '' }
  } }
  const tools = new Map(buildFfmpegTools(resolveConfig({ overwrite }), runner).map(tool => [tool.name, tool]))
  return { root, a, b, subtitle, calls, call: (name, args) => tools.get(name).execute(args) }
}
test('default extract frames uses separate runs and never replaces an existing frame', async t => {
  const f = fixture(t), keep = path.join(f.root, 'clip-001.png')
  writeFileSync(keep, 'user frame')
  const first = await f.call('ffmpeg_extract', { input: f.a, what: 'frames' })
  const second = await f.call('ffmpeg_extract', { input: f.a, what: 'frames' })
  assert.equal(readFileSync(keep, 'utf8'), 'user frame')
  assert.notEqual(first.output, second.output)
})
test('explicit extract sequence refuses existing files before invoking ffmpeg', async t => {
  const f = fixture(t), pattern = path.join(f.root, 'keep-%03d.png'), keep = path.join(f.root, 'keep-001.png')
  writeFileSync(keep, 'user frame')
  await assert.rejects(f.call('ffmpeg_extract', { input: f.a, what: 'frames', output: pattern }), /存在|覆盖/)
  assert.equal(readFileSync(keep, 'utf8'), 'user frame')
  assert.equal(f.calls.length, 0)
})
test('overwrite=true still protects every concatenation input and subtitle source', async t => {
  const f = fixture(t, true)
  await assert.rejects(f.call('ffmpeg_concat', { inputs: [f.a, f.b], output: f.b }), /输入|源文件/)
  await assert.rejects(f.call('ffmpeg_subtitle', { input: f.a, subtitle: f.subtitle, output: f.subtitle }), /输入|源文件/)
  assert.equal(f.calls.length, 0)
  assert.equal(readFileSync(f.b, 'utf8'), 'keep original')
})
test('output hard links cannot alias the original input even with overwrite=true', t => {
  const f = fixture(t, true), alias = path.join(f.root, 'alias.mp4')
  linkSync(f.a, alias)
  assert.throws(() => resolveOutputPath(f.a, alias, '', '.mp4', true), /输入|源文件/)
})
test('case-distinct POSIX output remains usable', { skip: process.platform === 'win32' }, t => {
  const f = fixture(t, true), output = path.join(f.root, 'CLIP.mp4')
  assert.equal(resolveOutputPath(f.a, output, '', '.mp4', true), output)
})
