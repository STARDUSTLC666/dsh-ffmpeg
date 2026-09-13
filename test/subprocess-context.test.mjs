import test from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../lib/index.js'

test('ffmpeg_health preserves the subprocess service receiver', async (t) => {
  const definitions = new Map()
  const service = {
    internals: { calls: [] },
    spawn(spec) {
      this.internals.calls.push(spec)
      return {
        done: Promise.resolve({ exitCode: 0, signal: null }),
        collected: { stdout: { readFrom: () => ({ text: 'fixture version 1.0\n' }) } },
        terminate() {},
      }
    },
  }
  apply({
    subprocess: service,
    tools: { register(definition) { definitions.set(definition.name, definition); return () => {} } },
    on() {},
  }, {})
  const result = await definitions.get('ffmpeg_health').execute({}, { signal: new AbortController().signal })
  assert.equal(result.ok, true, JSON.stringify(result))
  assert.equal(service.internals.calls.length, 2)
  assert.deepEqual(service.internals.calls.map(spec => spec.argv.slice(1)), [['-version'], ['-version']])
})
