/**
 * 文档漂移守卫：README（中英）声明的测试数量必须与 test/*.test.mjs 的实际声明数一致。
 * 统计口径是「顶层 test(...) 声明数」——本仓库所有用例都是平铺顶层声明，与 node --test
 * 的 tests 统计一致（含 skip 的声明也会被 node 计入 tests）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = dirname(fileURLToPath(import.meta.url))
const rootDir = join(testDir, '..')

/** 统计所有测试文件里的顶层 test(...) / test.skip(...) 声明数。 */
function countDeclaredTests() {
  let total = 0
  for (const file of readdirSync(testDir).filter((name) => name.endsWith('.test.mjs'))) {
    const source = readFileSync(join(testDir, file), 'utf8')
    total += (source.match(/^[ \t]*test(?:\.\w+)?\s*\(/gm) ?? []).length
  }
  return total
}

/** 从 README 的 pnpm test 注释里取测试数量。 */
function readmeTestCount(file, pattern) {
  const match = readFileSync(join(rootDir, file), 'utf8').match(pattern)
  assert.ok(match, file + ' 应声明测试数量（pnpm test 注释）')
  return Number(match[1])
}

test('README 中英声明的测试数量与实际用例数一致', () => {
  const actual = countDeclaredTests()
  const zh = readmeTestCount('README.md', /构建 \+ (\d+)\s*个测试/)
  const en = readmeTestCount('README.en.md', /build \+ (\d+)\s*tests/)
  assert.equal(zh, actual, 'README.md 写的 ' + zh + ' 个测试，实际 ' + actual + ' 个')
  assert.equal(en, actual, 'README.en.md says ' + en + ' tests, actual ' + actual)
})
