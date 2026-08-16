import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveConfig } from '../lib/index.js'

test('ffmpeg/ffprobe 路径：显式配置优先于环境变量', () => {
  const cfg = resolveConfig({ ffmpegPath: 'C:\\tools\\ffmpeg.exe', ffprobePath: 'C:\\tools\\ffprobe.exe' }, { DSH_FFMPEG_PATH: '/usr/bin/ffmpeg', DSH_FFPROBE_PATH: '/usr/bin/ffprobe' })
  assert.equal(cfg.ffmpegPath, 'C:\\tools\\ffmpeg.exe')
  assert.equal(cfg.ffprobePath, 'C:\\tools\\ffprobe.exe')
})

test('DSH_FFMPEG_PATH / DSH_FFPROBE_PATH 环境变量回退', () => {
  const cfg = resolveConfig({}, { DSH_FFMPEG_PATH: ' /opt/ffmpeg ', DSH_FFPROBE_PATH: '/opt/ffprobe' })
  assert.equal(cfg.ffmpegPath, '/opt/ffmpeg')
  assert.equal(cfg.ffprobePath, '/opt/ffprobe')
})

test('无配置无环境变量时回退 PATH 命令名', () => {
  const cfg = resolveConfig({}, {})
  assert.equal(cfg.ffmpegPath, 'ffmpeg')
  assert.equal(cfg.ffprobePath, 'ffprobe')
})
