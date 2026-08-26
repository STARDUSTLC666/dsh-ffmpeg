import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply, inject } from '../lib/index.js'

/** 假 ctx：收集工具注册、spawn 规格与 dispose 监听。 */
function makeFakeCtx() {
  const registered = []
  const spawns = []
  const listeners = {}
  const ctx = {
    subprocess: {
      spawn(spec) {
        spawns.push(spec)
        return {
          done: Promise.resolve({ exitCode: 0, signal: null }),
          collected: {},
          terminate() {},
        }
      },
    },
    tools: {
      register(definition) {
        registered.push(definition)
        return () => {
          const index = registered.indexOf(definition)
          if (index >= 0) registered.splice(index, 1)
        }
      },
    },
    on(event, listener) {
      (listeners[event] ??= []).push(listener)
      return () => {}
    },
  }
  return { ctx, registered, spawns, listeners }
}

test('inject 声明 subprocess 与 tools', () => {
  assert.deepEqual(inject, ['subprocess', 'tools'])
})

test('apply 注册 9 个工具', () => {
  const { ctx, registered } = makeFakeCtx()
  apply(ctx, {})
  assert.equal(registered.length, 9)
})

test('apply 在配置缺失/非法时不抛，仅告警', () => {
  const first = makeFakeCtx()
  assert.doesNotThrow(() => apply(first.ctx, {}))
  const second = makeFakeCtx()
  assert.doesNotThrow(() => apply(second.ctx, { timeoutMs: -5 }))
  assert.equal(second.registered.length, 9)
})

test('dispose 触发时卸载全部工具', () => {
  const { ctx, registered, listeners } = makeFakeCtx()
  apply(ctx, {})
  assert.equal(registered.length, 9)
  for (const listener of listeners.dispose ?? []) listener()
  assert.equal(registered.length, 0)
})
