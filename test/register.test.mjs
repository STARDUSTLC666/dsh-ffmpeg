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

test('apply 注册 10 个工具', () => {
  const { ctx, registered } = makeFakeCtx()
  apply(ctx, {})
  assert.equal(registered.length, 10)
})

test('apply 接受空配置，无效配置直接报错且不注册工具', () => {
  const first = makeFakeCtx()
  assert.doesNotThrow(() => apply(first.ctx, {}))
  const second = makeFakeCtx()
  assert.throws(() => apply(second.ctx, { timeoutMs: -5 }), /timeoutMs/)
  assert.equal(second.registered.length, 0)
})

test('dispose 触发时卸载全部工具', () => {
  const { ctx, registered, listeners } = makeFakeCtx()
  apply(ctx, {})
  assert.equal(registered.length, 10)
  for (const listener of listeners.dispose ?? []) listener()
  assert.equal(registered.length, 0)
})
