import test from 'node:test';
import assert from 'node:assert/strict';
import { subjects, lessons, questions } from '../src/content.js';
import { normalizeProgress, loadProgress, saveProgress, clearProgress } from '../src/storage.js';
import { createQuestion, submitAnswer } from '../src/quiz.js';
import { messages } from '../src/i18n.js';
import { renderApp } from '../src/ui.js';
test('legacy progress survives migration and invalid values are removed',()=>{
 const p=normalizeProgress({lang:'pl',currentLesson:2,done:[0,0,3,999,-1],attempts:4,score:8});
 assert.equal(p.currentLessonId,lessons[2].id); assert.deepEqual(p.done,[lessons[0].id,lessons[3].id]); assert.equal(p.score,4); assert.equal(p.lang,'pl');
});
test('corrupt, blocked and future storage do not crash or silently overwrite future data',()=>{
 for(const raw of ['{','null','[]','42']) assert.doesNotThrow(()=>loadProgress({getItem:()=>raw}));
 assert.equal(loadProgress({getItem:()=>'{'}).warning,'storageLoad');
 assert.equal(loadProgress({getItem:()=>'{"version":9}'}).writable,false);
 const blocked={getItem(){throw Error()},setItem(){throw Error()},removeItem(){throw Error()}};
 assert.equal(loadProgress(blocked).warning,'storageLoad'); assert.equal(saveProgress(blocked,{}),false); assert.equal(clearProgress(blocked),false);
 assert.equal(normalizeProgress({attempts:-2,score:Infinity}).attempts,0);
});
test('correct answer is scored at every display position and duplicate submissions are rejected',()=>{
 for(const q of questions) {
  const positions=new Set();
  for(const random of [()=>0,()=>.4,()=>.999]) {
   const s=createQuestion(q,random);positions.add(s.options.indexOf(q.correctId));
   assert.equal(submitAnswer(q,s,'unknown'),null);
   assert.equal(submitAnswer(q,s,q.correctId),true);assert.equal(submitAnswer(q,s,q.correctId),null);
  }
  assert.equal(positions.size,3);
  const s=createQuestion(q,()=>0);assert.equal(submitAnswer(q,s,q.options.find(o=>o.id!==q.correctId).id),false);
 }
});
test('all original lessons and questions retained, translations cover UI and content',()=>{
 assert.equal(lessons.length,4);assert.equal(questions.length,6);
 assert.deepEqual(Object.keys(messages.de).sort(),Object.keys(messages.pl).sort());
 for(const lang of ['de','pl']) {
  for(const q of questions) {assert.ok(q.text[lang]);assert.ok(q.explanation[lang]);for(const o of q.options) assert.ok(o.text[lang]);}
  const state={progress:normalizeProgress({lang}),questionIndex:0,question:createQuestion(questions[0]),offlineStatus:'offlineUnknown'};
  for(const tab of ['home','subjects','book','lesson','quiz','settings']) {state.tab=tab;const html=renderApp(state);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('onclick='));}
 }
});

test('German default and Polish training variant are independent of language',()=>{
 assert.equal(normalizeProgress({lang:'pl'}).trainingCountry,'DE');
 assert.equal(normalizeProgress({version:1,lang:'de',trainingCountry:'PL'}).trainingCountry,'PL');
 assert.equal(normalizeProgress({trainingCountry:'unknown'}).trainingCountry,'DE');
 for(const item of [...lessons,...questions]) assert.equal(item.scope,'EASA');
});

test('offline release covers every module and its hashes match the local files', async()=>{
 const {readFile,readdir,access}=await import('node:fs/promises');
 const {createHash}=await import('node:crypto');
 const vm=await import('node:vm');
 const box={self:{}};vm.runInNewContext(await readFile(new URL('../release-manifest.js',import.meta.url),'utf8'),box);
 const release=box.self.PILOT_RELEASE;
 for(const name of await readdir(new URL('../src/',import.meta.url))) assert.ok(release.assets.some(a=>a.url.split('?')[0]==='./src/'+name),name);
 for(const asset of release.assets) {
  const name=asset.url==='./'?'index.html':asset.url.split('?')[0];
  const bytes=await readFile(new URL('../'+name,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
 }
 assert.match(release.id,/^1\.1\.0-[a-f0-9]{16}$/);
});
test('all subject descriptions and both manifest identities are present',async()=>{
 const {readFile}=await import('node:fs/promises');
 assert.deepEqual(subjects.map(s=>s.description.de),['Aerodynamik, Auftrieb, Widerstand','Motor, Struktur, Instrumente','Wetter, Wind, Wolken','Karten, Kurse, GPS','Flugregeln und Lufträume','Masse, Schwerpunkt, Startstrecke','Sauerstoff, Müdigkeit, Entscheidungen','Checklisten, Notfälle','Flugfunk und Phraseologie']);for(const s of subjects)for(const lang of ['de','pl'])assert.ok(s.description[lang]);
 const de=JSON.parse(await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
 const pl=JSON.parse(await readFile(new URL('../manifest.pl.webmanifest',import.meta.url),'utf8'));
 for(const key of ['id','start_url','scope','name'])assert.equal(de[key],pl[key]);
 assert.equal(de.lang,'de');assert.equal(pl.lang,'pl');
});
