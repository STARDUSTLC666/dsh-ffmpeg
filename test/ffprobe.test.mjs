import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseProbeJson } from '../lib/index.js'

const fixture = JSON.stringify({
  format: { format_name: 'mov,mp4,m4a,3gp,3g2,mj2', duration: '10.5', size: '123456', bit_rate: '980000' },
  streams: [
    { codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080, avg_frame_rate: '30000/1001', r_frame_rate: '30000/1001', duration: '10.5', bit_rate: '900000' },
    { codec_type: 'audio', codec_name: 'aac', sample_rate: '48000', channels: 2, duration: '10.4' },
    { codec_type: 'subtitle', codec_name: 'mov_text', tags: { language: 'eng' } },
    { codec_type: 'data', codec_name: 'bin_data' },
  ],
})

test('解析完整 ffprobe JSON', () => {
  const media = parseProbeJson(fixture)
  assert.equal(media.formatName, 'mov,mp4,m4a,3gp,3g2,mj2')
  assert.equal(media.durationSeconds, 10.5)
  assert.equal(media.sizeBytes, 123456)
  assert.equal(media.video.width, 1920)
  assert.equal(media.video.height, 1080)
  assert.ok(Math.abs(media.video.fps - 30000 / 1001) < 0.001)
  assert.equal(media.video.codec, 'h264')
  assert.equal(media.audio.length, 1)
  assert.equal(media.audio[0].channels, 2)
  assert.equal(media.subtitles.length, 1)
  assert.equal(media.subtitles[0].language, 'eng')
})

test('多视频流全部进入 videos，video 保留第一个', () => {
  const media = parseProbeJson(JSON.stringify({
    format: { format_name: 'mov' },
    streams: [
      { codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080 },
      { codec_type: 'video', codec_name: 'hevc', width: 640, height: 360 },
      { codec_type: 'audio', codec_name: 'aac' },
    ],
  }))
  assert.equal(media.videos.length, 2)
  assert.equal(media.video.codec, 'h264')
  assert.equal(media.videos[1].codec, 'hevc')
})

test('N/A 与缺失字段归一化为 null/默认', () => {
  const media = parseProbeJson(JSON.stringify({ format: { duration: 'N/A' }, streams: [{ codec_type: 'video', codec_name: 'mpeg4' }] }))
  assert.equal(media.durationSeconds, null)
  assert.equal(media.video.width, 0)
  assert.equal(media.video.fps, null)
  assert.deepEqual(media.audio, [])
})

test('非法 JSON 抛中文错误', () => {
  assert.throws(() => parseProbeJson('not json'), /ffprobe 输出解析失败/)
})
