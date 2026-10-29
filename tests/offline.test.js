import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfflineManager } from '../src/offline.js';
async function withBrowser(run) {
 const descriptors=Object.fromEntries(['window','navigator'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const events={},windowEvents={};
 const navigator={serviceWorker:{addEventListener:(name,fn)=>{events[name]=fn;}}};
 const window={isSecureContext:true,addEventListener:(name,fn)=>{windowEvents[name]=fn;}};
 Object.defineProperty(globalThis,'navigator',{value:navigator,configurable:true});
 Object.defineProperty(globalThis,'window',{value:window,configurable:true});
 try {await run(navigator,events);} finally {
  for(const key of ['window','navigator']){if(descriptors[key])Object.defineProperty(globalThis,key,descriptors[key]);else delete globalThis[key];}
 }
}
test('offline registration rejection and a hanging registration become retryable errors',async()=>{
 await withBrowser(async navigator=>{
  const updates=[];
  navigator.serviceWorker.register=async()=>{throw Error('denied');};
  const manager=createOfflineManager(s=>updates.push(s),10);await manager.start();
  assert.equal(updates.at(-1).failed,true);
 });
 await withBrowser(async navigator=>{
  const updates=[];
  navigator.serviceWorker.register=()=>new Promise(()=>{});
  createOfflineManager(s=>updates.push(s),10).start();
  await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(updates.at(-1).failed,true);
 });
});
test('a later response from the old cache does not hide failed update installation',async()=>{
 await withBrowser(async(navigator,events)=>{
  let statechange;
  const active={state:'activated',scriptURL:'http://localhost/sw.js',addEventListener(){},postMessage(){}};
  const incoming={state:'installing',addEventListener:(name,fn)=>{statechange=fn;}};
  const registration={active,installing:incoming,waiting:null,addEventListener(){}};
  navigator.serviceWorker.register=async()=>registration;
  const updates=[];await createOfflineManager(s=>updates.push(s),50).start();
  incoming.state='redundant';registration.installing=null;statechange();
  events.message({data:{type:'OFFLINE_STATUS',ready:true},source:active});
  assert.equal(updates.at(-1).failed,true);assert.equal(updates.at(-1).ready,true);
 });
});
