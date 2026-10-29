import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,dirname} from 'node:path'
import {buildFfmpegTools,resolveConfig} from '../lib/index.js'

function fixture(t,{probe,exitAt,emptyAt,abortAt}={}){
 const root=mkdtempSync(join(tmpdir(),'storyboard-test-'));t.after(()=>rmSync(root,{recursive:true,force:true}))
 const input=join(root,'source.mp4');writeFileSync(input,'original-video')
 const controller=new AbortController(),calls=[],scratch=[]
 const runner={async run(argv,options){
  calls.push({argv,options});const n=calls.length
  if(n===1)return{exitCode:0,signal:null,stderr:'',stdout:JSON.stringify(probe||{format:{duration:'12'},streams:[{codec_type:'video',codec_name:'h264',width:640,height:360,avg_frame_rate:'2/1',duration:'12'}]})}
  const file=argv.at(-1);scratch.push(dirname(file))
  if(n!==emptyAt)writeFileSync(file,'completed-'+n)
  if(n===abortAt)controller.abort(new Error('user-cancelled'))
  return{exitCode:n===exitAt?1:0,signal:null,stderr:n===exitAt?'decode-failed':'',stdout:''}
 }}
 const tool=buildFfmpegTools(resolveConfig({timeoutMs:10000}),runner).find(x=>x.name==='ffmpeg_storyboard')
 return{root,input,controller,calls,scratch,tool,exec:{signal:controller.signal,agent:{session:{header:{cwd:root}}}}}
}

test('storyboard produces one complete grid and keeps target-time cells in reading order',async t=>{
 const f=fixture(t),value=await f.tool.execute({input:'source.mp4',count:4,columns:2,width:160,start:2,end:10},f.exec)
 assert.deepEqual(value.frames.map(x=>[x.row,x.column,x.seconds]),[[1,1,2],[1,2,4],[2,1,6],[2,2,8]])
 assert.equal(value.width,344);assert.equal(value.height,204);assert.equal(value.timestampKind,'requested-seek-time')
 assert.equal(readFileSync(value.output,'utf8'),'completed-6');assert.equal(readFileSync(f.input,'utf8'),'original-video')
 assert.ok(f.calls.every(c=>c.options.signal===f.controller.signal&&c.options.timeoutMs>0&&c.options.timeoutMs<=10000))
 assert.ok(f.scratch.every(p=>!existsSync(p)));assert.match(f.tool.output.render({},value)[0].text,/#4（2 行 2 列）：8 秒/)
})

test('storyboard preserves existing outputs and source aliases',async t=>{
 const f=fixture(t),old=join(f.root,'source-storyboard.png');writeFileSync(old,'old-sheet')
 const value=await f.tool.execute({input:f.input,count:2},f.exec)
 assert.equal(readFileSync(old,'utf8'),'old-sheet');assert.match(value.output,/_1\.png$/)
 await assert.rejects(f.tool.execute({input:f.input,output:f.input},f.exec),/输入文件相同|同一文件/)
 assert.equal(readFileSync(f.input,'utf8'),'original-video')
})

test('cancelled sampling removes scratch and never publishes a partial sheet',async t=>{
 const f=fixture(t,{abortAt:3}),output=join(f.root,'cancelled.png')
 await assert.rejects(f.tool.execute({input:f.input,output,count:4},f.exec),/user-cancelled/)
 assert.ok(!existsSync(output));assert.ok(f.scratch.every(p=>!existsSync(p)));assert.equal(f.calls.length,3)
})

test('failed or empty samples remove scratch and preserve the final output',async t=>{
 for(const options of [{exitAt:3},{emptyAt:3}]){
  const f=fixture(t,options),output=join(f.root,'failure.png')
  await assert.rejects(f.tool.execute({input:f.input,output,count:4},f.exec),/decode-failed|无法取得第 2 格/)
  assert.ok(!existsSync(output));assert.ok(f.scratch.every(p=>!existsSync(p)))
 }
})

test('storyboard refuses invalid sizes, audio-only media, unknown duration and invalid ranges',async t=>{
 const f=fixture(t)
 for(const args of [{count:1},{count:37},{columns:7},{width:159},{width:640.5}])await assert.rejects(f.tool.execute({input:f.input,...args},f.exec),/必须是/)
 assert.equal(f.calls.length,0)
 for(const [probe,args,pattern]of [
  [{format:{duration:'12'},streams:[{codec_type:'audio'}]},{},/没有视频画面/],
  [{format:{},streams:[{codec_type:'video',width:20,height:20}]},{},/无法确定视频时长/],
  [undefined,{start:11,end:10},/采样范围/],
  [undefined,{end:13},/采样范围/],
  [undefined,{start:11.9},/太靠近结尾/],
 ]){const sample=fixture(t,{probe});await assert.rejects(sample.tool.execute({input:sample.input,...args},sample.exec),pattern)}
})

test('fractional-frame-rate short clips never round a seek past their last frame',async t=>{
 const f=fixture(t,{probe:{format:{duration:'0.1001'},streams:[{codec_type:'video',width:160,height:90,avg_frame_rate:'30000/1001',duration:'0.1001'}]}})
 const value=await f.tool.execute({input:f.input,count:12},f.exec),last=2*1001/30000
 assert.ok(value.frames.every(frame=>frame.seconds<=last))
 const seeks=f.calls.filter(call=>call.argv.includes('-ss')).map(call=>Number(call.argv[call.argv.indexOf('-ss')+1]))
 assert.equal(seeks.length,12);assert.ok(seeks.every(time=>time<=last));assert.equal(seeks.at(-1),0.066733)
})
