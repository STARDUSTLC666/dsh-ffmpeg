import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

const dir = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-tools-'))
const input = join(dir, 'video.mp4')
writeFileSync(input, 'x')
const sub = join(dir, 'sub.srt')
writeFileSync(sub, '1')

/** 记录 argv 的假 runner，可编程结果。 */
function makeRunner(results = []) {
  const calls = []
  return {
    calls,
    async run(argv, options) {
      calls.push({ argv: [...argv], timeoutMs: options?.timeoutMs ?? null, signal: options?.signal ?? null })
      const preset = results.shift()
      return { exitCode: preset?.exitCode ?? 0, signal: preset?.signal ?? null, stdout: preset?.stdout ?? '', stderr: preset?.stderr ?? '' }
    },
  }
}

const cfg = resolveConfig({ timeoutMs: 120000 })

test('构建 10 个工具且名字正确', () => {
  const names = buildFfmpegTools(cfg, makeRunner()).map((t) => t.name).sort()
  assert.deepEqual(names, ['ffmpeg_adjust', 'ffmpeg_concat', 'ffmpeg_cut', 'ffmpeg_encode', 'ffmpeg_extract', 'ffmpeg_frames', 'ffmpeg_gif', 'ffmpeg_health', 'ffmpeg_probe', 'ffmpeg_subtitle'])
})

test('每个工具的 parameters 是编译好的 object JSON Schema，输出含 render', () => {
  for (const tool of buildFfmpegTools(cfg, makeRunner())) {
    assert.equal(tool.parameters.type, 'object')
    assert.equal(typeof tool.parameters.properties, 'object')
    assert.equal(tool.output.schema.type, 'object')
    assert.equal(tool.output.schema.additionalProperties, true)
    assert.equal(typeof tool.output.render, 'function')
    assert.equal(typeof tool.execute, 'function')
    assert.deepEqual(JSON.parse(JSON.stringify(tool.parameters)), tool.parameters)
    assert.deepEqual(JSON.parse(JSON.stringify(tool.output.schema)), tool.output.schema)
  }
  const probe = buildFfmpegTools(cfg, makeRunner()).find((tool) => tool.name === 'ffmpeg_probe')
  assert.equal(probe.output.schema.properties.video.oneOf[1].type, 'null')
  assert.equal(probe.output.schema.properties.subtitles.items.properties.language.oneOf[1].type, 'null')
})

const probeJson = JSON.stringify({
  format: { format_name: 'mov,mp4', duration: '3.0', size: '1000', bit_rate: '500000' },
  streams: [{ codec_type: 'video', codec_name: 'h264', width: 640, height: 360, avg_frame_rate: '25/1' }],
})

test('ffmpeg_probe 归一化返回', async () => {
  const runner = makeRunner([{ stdout: probeJson }])
  const probe = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_probe')
  const value = await probe.execute({ input })
  assert.equal(value.ok, true)
  assert.equal(value.formatName, 'mov,mp4')
  assert.equal(value.durationSeconds, 3)
  assert.equal(value.video.width, 640)
  assert.equal(value.video.fps, 25)
  assert.equal(runner.calls[0].argv[0], 'ffprobe')
  assert.ok(runner.calls[0].argv.includes(input))
})

test('ffmpeg_probe 执行失败抛中文错误（含 stderr 尾部）', async () => {
  const runner = makeRunner([{ exitCode: 1, stderr: 'No such file' }])
  const probe = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_probe')
  await assert.rejects(() => probe.execute({ input }), /ffprobe.*失败.*No such file/)
})

test('ffmpeg_cut：end 优先于 duration，默认流拷贝', async () => {
  const runner = makeRunner()
  const cut = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_cut')
  const value = await cut.execute({ input, start: '00:00:01.5', end: 5 })
  assert.equal(value.duration, 3.5)
  assert.equal(value.reencode, false)
  assert.equal(value.output, join(dir, 'video.cut.mp4'))
  assert.ok(runner.calls[0].argv.includes('-c') && runner.calls[0].argv.includes('copy'))
  assert.ok(runner.calls[0].argv.includes('1.500') && runner.calls[0].argv.includes('3.500'))
})

test('ffmpeg_cut：end 不晚于 start 抛错；缺输入抛错', async () => {
  const cut = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_cut')
  await assert.rejects(() => cut.execute({ input, start: 5, end: 3 }), /end 必须晚于 start/)
  await assert.rejects(() => cut.execute({ input, start: 0 }), /片段时长/)
  await assert.rejects(() => cut.execute({ input: join(dir, 'nope.mp4'), duration: 1 }), /输入文件不存在/)
})

test('ffmpeg_concat 流拷贝：写 list 文件、调用后清理', async () => {
  const second = join(dir, 'part2.mp4')
  writeFileSync(second, 'x')
  const runner = makeRunner()
  const originalRun = runner.run.bind(runner)
  runner.run = async (argv, options) => {
    const listIndex = argv.indexOf('-i') + 1
    const listPath = argv[listIndex]
    assert.ok(existsSync(listPath), 'list 文件在运行时应存在')
    assert.ok(readFileSync(listPath, 'utf8').includes(input.replace(/\\/g, '/')))
    return originalRun(argv, options)
  }
  const concat = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_concat')
  const value = await concat.execute({ inputs: [input, second] })
  assert.equal(value.count, 2)
  assert.ok(runner.calls[0].argv.includes('-f') && runner.calls[0].argv.includes('concat'))
})

test('ffmpeg_concat：少于 2 个输入抛错', async () => {
  const concat = buildFfmpegTools(cfg, makeRunner()).find((t) => t.name === 'ffmpeg_concat')
  await assert.rejects(() => concat.execute({ inputs: [input] }), /至少需要 2 个/)
  await assert.rejects(() => concat.execute({}), /至少需要 2 个/)
})

test('ffmpeg_encode：预设校验与默认值', async () => {
  const runner = makeRunner()
  const encode = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_encode')
  const value = await encode.execute({ input })
  assert.equal(value.preset, 'bilibili-1080p')
  assert.ok(runner.calls[0].argv.includes('6000k'))
  await assert.rejects(() => encode.execute({ input, preset: 'nope' }), /preset 必须是/)
  await assert.rejects(() => encode.execute({ input, crf: 99 }), /crf 必须是/)
  await assert.rejects(() => encode.execute({ input, scale: 'abc' }), /scale 格式/)
})

test('ffmpeg_subtitle：烧录 filter + 缺字幕文件抛错', async () => {
  const runner = makeRunner()
  const subTool = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_subtitle')
  const value = await subTool.execute({ input, subtitle: sub })
  assert.equal(value.mode, 'burn')
  const filter = runner.calls[0].argv[runner.calls[0].argv.indexOf('-vf') + 1]
  assert.ok(filter.startsWith("subtitles='") && filter.endsWith("'") && filter.includes('sub.srt'))
  await assert.rejects(() => subTool.execute({ input, subtitle: join(dir, 'missing.srt') }), /输入文件不存在/)
})

test('ffmpeg_extract：四种模式命名与参数', async () => {
  const runner = makeRunner()
  const extract = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_extract')
  const audio = await extract.execute({ input, what: 'audio' })
  assert.equal(audio.output, join(dir, 'video.audio.m4a'))
  const frame = await extract.execute({ input, what: 'frame' })
  assert.equal(frame.output, join(dir, 'video.frame.png'))
  const frames = await extract.execute({ input, what: 'frames', fps: 2 })
  assert.ok(frames.output.endsWith('video-%03d.png'))
  await assert.rejects(() => extract.execute({ input, what: 'nope' }), /what 必须是/)
})

test('ffmpeg_gif：随机临时目录承载调色板，清理时不碰用户同名文件', async () => {
  const runner = makeRunner()
  let palettePath = ''
  const originalRun = runner.run.bind(runner)
  runner.run = async (argv, options) => {
    if (argv.some((part) => part.includes('palettegen'))) {
      palettePath = argv.at(-1)
      assert.equal(existsSync(dirname(palettePath)), true, '执行期间临时目录应存在')
    }
    return originalRun(argv, options)
  }
  const gif = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_gif')
  const explicitOutput = join(dir, 'safe.gif')
  const userPalette = explicitOutput + '.palette.png'
  writeFileSync(userPalette, 'user-owned')
  const value = await gif.execute({ input, output: explicitOutput, duration: 2, fps: 99, width: 9999 })
  assert.equal(runner.calls.length, 2)
  assert.equal(value.fps, 30)
  assert.equal(value.width, 1280)
  assert.ok(runner.calls[0].argv.some((part) => part.includes('palettegen')))
  assert.ok(runner.calls[1].argv.some((part) => part.includes('paletteuse')))
  assert.notEqual(palettePath, userPalette)
  assert.match(palettePath.replace(/\\/g, '/'), /\/dsh-ffmpeg-gif-[^/]+\/palette\.png$/)
  assert.equal(existsSync(dirname(palettePath)), false, '内部临时目录应在 finally 中清理')
  assert.equal(readFileSync(userPalette, 'utf8'), 'user-owned')
})

test('ffmpeg_gif：第二遍失败也清理随机临时目录', async () => {
  const runner = makeRunner([{ exitCode: 0 }, { exitCode: 1, stderr: 'paletteuse failed' }])
  let palettePath = ''
  const originalRun = runner.run.bind(runner)
  runner.run = async (argv, options) => {
    if (argv.some((part) => part.includes('palettegen'))) palettePath = argv.at(-1)
    return originalRun(argv, options)
  }
  const gif = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_gif')
  await assert.rejects(() => gif.execute({ input, output: join(dir, 'failed.gif'), duration: 1 }), /GIF 合成失败.*paletteuse failed/)
  assert.notEqual(palettePath, '')
  assert.equal(existsSync(dirname(palettePath)), false)
})

test('ffmpeg_extract：frames 显式输出自动补 %03d 与扩展名', async () => {
  const runner = makeRunner()
  const extract = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_extract')
  const plain = await extract.execute({ input, what: 'frames', output: join(dir, 'frames') })
  assert.equal(plain.output, join(dir, 'frames-%03d.png'))
  const ext = await extract.execute({ input, what: 'frames', output: join(dir, 'frames.png') })
  assert.equal(ext.output, join(dir, 'frames-%03d.png'))
  const pattern = await extract.execute({ input, what: 'frames', output: join(dir, 'seq-%04d.png') })
  assert.equal(pattern.output, join(dir, 'seq-%04d.png'))
})

test('超时透传给 runner', async () => {
  const runner = makeRunner()
  const cut = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_cut')
  await cut.execute({ input, duration: 1 })
  assert.equal(runner.calls[0].timeoutMs, 120000)
})

test('工具执行上下文的 AbortSignal 透传给所有前台子进程入口', async () => {
  const controller = new AbortController()
  const exec = { signal: controller.signal }
  const probeRunner = makeRunner([{ stdout: probeJson }])
  const probe = buildFfmpegTools(cfg, probeRunner).find((t) => t.name === 'ffmpeg_probe')
  await probe.execute({ input }, exec)
  assert.equal(probeRunner.calls[0].signal, controller.signal)

  const healthRunner = makeRunner([{ stdout: 'ffmpeg version test' }, { stdout: 'ffprobe version test' }])
  const health = buildFfmpegTools(cfg, healthRunner).find((t) => t.name === 'ffmpeg_health')
  await health.execute({}, exec)
  assert.equal(healthRunner.calls.length, 2)
  assert.ok(healthRunner.calls.every((call) => call.signal === controller.signal))
})

test('ffmpeg_health 不吞掉调用取消错误', async () => {
  const controller = new AbortController()
  const reason = new Error('caller cancelled health check')
  controller.abort(reason)
  const runner = { async run() { throw reason } }
  const health = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_health')
  await assert.rejects(() => health.execute({}, { signal: controller.signal }), /caller cancelled/)
})

test('取消后的工具调用抛取消原因，而不是「退出码 null：无错误输出」', async () => {
  const controller = new AbortController()
  const reason = new Error('caller cancelled cut')
  controller.abort(reason)
  const runner = { async run() { return { exitCode: null, signal: 'SIGTERM', stdout: '', stderr: '' } } }
  const cut = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_cut')
  await assert.rejects(
    () => cut.execute({ input, duration: 1 }, { signal: controller.signal }),
    (error) => {
      assert.match(String(error.message), /caller cancelled cut/)
      assert.doesNotMatch(String(error.message), /退出码 null/)
      return true
    },
  )
})

test('ffmpeg_health 在 signal 已 abort 后不再继续探测', async () => {
  const controller = new AbortController()
  const reason = new Error('caller cancelled before health check')
  controller.abort(reason)
  const calls = []
  const runner = { async run(argv) { calls.push([...argv]); return { exitCode: 0, signal: null, stdout: 'ffmpeg version 6.0', stderr: '' } } }
  const health = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_health')
  await assert.rejects(() => health.execute({}, { signal: controller.signal }), /caller cancelled before health check/)
  assert.equal(calls.length, 0)
})

test('ffmpeg_health 探测途中被取消后不再探测下一个二进制', async () => {
  const controller = new AbortController()
  const reason = new Error('cancelled during ffmpeg check')
  const calls = []
  const runner = {
    async run(argv) {
      calls.push([...argv])
      controller.abort(reason)
      return { exitCode: 0, signal: null, stdout: 'ffmpeg version 6.0', stderr: '' }
    },
  }
  const health = buildFfmpegTools(cfg, runner).find((t) => t.name === 'ffmpeg_health')
  await assert.rejects(() => health.execute({}, { signal: controller.signal }), /cancelled during ffmpeg check/)
  assert.equal(calls.length, 1)
})

test('execute 返回值可 JSON 序列化（无 undefined）', async () => {
  const second = join(dir, 'lossless-second.mp4')
  writeFileSync(second, 'x')
  const values = []

  let runner = makeRunner([{ stdout: probeJson }])
  let tools = buildFfmpegTools(cfg, runner)
  values.push(await tools.find((t) => t.name === 'ffmpeg_probe').execute({ input }))

  runner = makeRunner()
  tools = buildFfmpegTools(cfg, runner)
  values.push(await tools.find((t) => t.name === 'ffmpeg_cut').execute({ input, duration: 1 }))
  values.push(await tools.find((t) => t.name === 'ffmpeg_concat').execute({ inputs: [input, second] }))
  values.push(await tools.find((t) => t.name === 'ffmpeg_encode').execute({ input }))
  values.push(await tools.find((t) => t.name === 'ffmpeg_subtitle').execute({ input, subtitle: sub }))
  values.push(await tools.find((t) => t.name === 'ffmpeg_extract').execute({ input, what: 'audio' }))
  values.push(await tools.find((t) => t.name === 'ffmpeg_gif').execute({ input, duration: 1 }))
  values.push(await tools.find((t) => t.name === 'ffmpeg_frames').execute({ input, outputDir: join(dir, 'lossless-frames') }))

  runner = makeRunner([{ stdout: probeJson }])
  tools = buildFfmpegTools(cfg, runner)
  values.push(await tools.find((t) => t.name === 'ffmpeg_adjust').execute({ input, mute: true }))

  runner = makeRunner([{ stdout: 'ffmpeg version test' }, { stdout: 'ffprobe version test' }])
  tools = buildFfmpegTools(cfg, runner)
  values.push(await tools.find((t) => t.name === 'ffmpeg_health').execute({}))

  for (const value of values) assert.deepEqual(JSON.parse(JSON.stringify(value)), value)
})

test('cleanup', () => { rmSync(dir, { recursive: true, force: true }) })
