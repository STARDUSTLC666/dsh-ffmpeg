import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolveOutputPath, sanitizeName, assertInputFile } from '../lib/index.js'

const dir = mkdtempSync(join(tmpdir(), 'dsh-ffmpeg-paths-'))
const input = join(dir, 'video.mp4')
writeFileSync(input, 'x')

test('默认输出：输入同目录 + 后缀', () => {
  assert.equal(resolveOutputPath(input, undefined, '.cut', '.mp4', false), join(dir, 'video.cut.mp4'))
})

test('同名文件自动加序号', () => {
  writeFileSync(join(dir, 'video.cut.mp4'), 'x')
  assert.equal(resolveOutputPath(input, undefined, '.cut', '.mp4', false), join(dir, 'video.cut_1.mp4'))
})

test('overwrite=true 直接返回目标', () => {
  assert.equal(resolveOutputPath(input, undefined, '.cut', '.mp4', true), join(dir, 'video.cut.mp4'))
})

test('输出与输入相同被拒绝', () => {
  assert.throws(() => resolveOutputPath(input, input, '', '.mp4', false), /与输入文件相同/)
})

test('sanitizeName 清洗危险字符', () => {
  assert.equal(sanitizeName('a<b>:c|d?e*f'), 'a_b__c_d_e_f')
  assert.equal(sanitizeName('   '), 'output')
})

test('assertInputFile 缺文件/目录抛中文错误', () => {
  assert.throws(() => assertInputFile(join(dir, 'missing.mp4')), /输入文件不存在/)
  const subdir = join(dir, 'folder.mp4')
  mkdirSync(subdir)
  assert.throws(() => assertInputFile(subdir), /不是文件/)
})

test('cleanup', () => { rmSync(dir, { recursive: true, force: true }) })
