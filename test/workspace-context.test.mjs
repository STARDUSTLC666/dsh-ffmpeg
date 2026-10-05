import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { buildFfmpegTools, resolveConfig } from '../lib/index.js'

test('media and explicit output paths follow the session workspace, including frame patterns', async t => {
  const home = mkdtempSync(join(import.meta.dirname, '.workspace-'))
  t.after(() => rmSync(home, {recursive:true,force:true}))
  writeFileSync(join(home,'input.mp4'),'synthetic'); writeFileSync(join(home,'caption.srt'),'synthetic')
  mkdirSync(join(home,'out'))
  const calls = [], runner = { async run(argv) { calls.push([...argv]); return { exitCode:0,signal:null,stdout:'{"format":{},"streams":[]}',stderr:'' } } }
  const tool = name => buildFfmpegTools(resolveConfig({}),runner).find(x=>x.name===name)
  const context = { signal:new AbortController().signal,agent:{session:{header:{cwd:home}}} }
  assert.equal((await tool('ffmpeg_probe').execute({input:'input.mp4'},context)).input,join(home,'input.mp4'))
  const cut = await tool('ffmpeg_cut').execute({input:'input.mp4',duration:'1',output:'out/cut.mp4'},context)
  assert.equal(cut.output,join(home,'out/cut.mp4'))
  await tool('ffmpeg_subtitle').execute({input:'input.mp4',subtitle:'caption.srt',output:'out/sub.mp4'},context)
  assert.ok(calls.at(-1).some(arg=>arg.includes('caption.srt')))
  const extract = await tool('ffmpeg_extract').execute({input:'input.mp4',what:'frames',output:'out/frame-%03d.png'},context)
  assert.equal(extract.output,join(home,'out/frame-%03d.png'))
  const frames = await tool('ffmpeg_frames').execute({input:'input.mp4',times:['0'],outputDir:'out/frames'},context)
  assert.equal(dirname(frames.outputDir),join(home,'out/frames'))
})
test('an invalid optional time does not silently cut from zero or use a default duration', async t => {
  const home = mkdtempSync(join(import.meta.dirname,'.bad-time-'));t.after(()=>rmSync(home,{recursive:true,force:true}))
  const input = join(home,'input.mp4');writeFileSync(input,'synthetic')
  let runs = 0;const tools = buildFfmpegTools(resolveConfig({}),{async run(){runs++;throw Error('must not run')}})
  for (const [name,args] of [['ffmpeg_cut',{duration:'1',start:'typo'}],['ffmpeg_cut',{duration:'1',end:'typo'}],['ffmpeg_extract',{what:'frame',start:'typo'}],['ffmpeg_gif',{duration:'typo'}]]) await assert.rejects(tools.find(t=>t.name===name).execute({input,...args}),/非法/)
  assert.equal(runs,0)
})
