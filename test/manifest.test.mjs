import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

test('package.json 的 dsh.bundle.patch 指向存在的补丁文件', () => {
  const pkg = require('../package.json')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(existsSync(new URL('../cordis.patch.yml', import.meta.url)))
})

test('exports 暴露 ./package.json 与 ./cordis.patch.yml', () => {
  const pkg = require('../package.json')
  assert.equal(pkg.exports['./package.json'], './package.json')
  assert.equal(pkg.exports['./cordis.patch.yml'], './cordis.patch.yml')
  assert.equal(pkg.exports['.'].default, './lib/index.js')
})

test('files 白名单包含 lib、cordis.patch.yml、双 README', () => {
  const pkg = require('../package.json')
  for (const entry of ['lib', 'cordis.patch.yml', 'README.md', 'README.en.md']) {
    assert.ok(pkg.files.includes(entry), entry + ' 应在 files 白名单')
  }
})

test('cordis.patch.yml 插入行名为 dsh-ffmpeg', () => {
  const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(patch, /name: 'dsh-ffmpeg'/)
  assert.match(patch, /- insert:/)
})

test('零运行时依赖', () => {
  const pkg = require('../package.json')
  assert.equal(pkg.dependencies, undefined)
})

test('名称与版本正确', () => {
  const pkg = require('../package.json')
  assert.equal(pkg.name, 'dsh-ffmpeg')
  assert.equal(pkg.version, '0.1.0')
})
