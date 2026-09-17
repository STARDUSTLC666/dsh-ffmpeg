import test from 'node:test'
import assert from 'node:assert/strict'
import { apply, createSubprocessRunner } from '../lib/index.js'

/**
 * A stand-in for the host's `@deepseek-ai/dsh-subprocess-local`: its `spawn`
 * reads its own instance fields, so handing the method out detached leaves
 * `this === undefined` and blows up on `internals`. A bare-function mock cannot
 * catch that, which is how the bug reached users in the first place.
 */
function receiverDependentService() {
  return {
    internals: { calls: [] },
    spawn(spec) {
      this.internals.calls.push(spec)
      return {
        done: Promise.resolve({ exitCode: 0, signal: null }),
        collected: { stdout: { readFrom: () => ({ text: 'fixture version 1.0\n' }) }, stderr: { readFrom: () => ({ text: '' }) } },
        terminate() {},
      }
    },
  }
}

test('a detached spawn loses the receiver, and the closure wiring keeps it', async () => {
  const spec = { argv: ['ffmpeg', '-version'], cwd: '.', stdio: {}, graceMs: 1 }

  const detached = receiverDependentService()
  const broken = createSubprocessRunner(detached.spawn, 1000, 5000)
  await assert.rejects(() => broken.run(['ffmpeg', '-version']), /internals|Cannot read properties of undefined/,
    'this is the failure users saw; the mock has to be able to reproduce it')
  assert.equal(detached.internals.calls.length, 0)

  const kept = receiverDependentService()
  const working = createSubprocessRunner((s) => kept.spawn(s), 1000, 5000)
  const result = await working.run(['ffmpeg', '-version'])
  assert.equal(result.exitCode, 0, JSON.stringify(result))
  assert.equal(kept.internals.calls.length, 1)
  assert.deepEqual(kept.internals.calls[0].argv, spec.argv)
})

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
