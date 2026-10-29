// Starts only a loopback server. All release/update fixtures live in memory.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync,spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const old={};for(const name of ['index.html','sw.js','manifest.webmanifest','icon-192.png','icon-512.png'])old[name]=execFileSync('git',['show',`409d47e100488ce51917ea5ba7fce1e7cce36800:${name}`],{cwd:root});
const releaseBox={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'release-manifest.js'),'utf8'),releaseBox);
const release=releaseBox.self.PILOT_RELEASE;
let mode='new',fault=null,blockedRequests=0;
const hits=[];
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith('/pilot-academy/')) {res.writeHead(404);return res.end();}
 const name=decodeURIComponent(url.pathname.slice('/pilot-academy/'.length))||'index.html';
 if(name.includes('..')){res.writeHead(404);return res.end();}
 const isAssetFetch=req.headers['sec-fetch-dest']==='empty';
 hits.push({name,query:url.search,dest:req.headers['sec-fetch-dest'],mode:req.headers['sec-fetch-mode']});
 if((fault==='module'||fault==='oneModule')&&name==='src/ui.js'){if(fault==='oneModule')fault=null;blockedRequests++;res.writeHead(503);return res.end();}
 if(fault==='install'&&name==='src/ui.js'&&isAssetFetch){blockedRequests++;res.writeHead(503);return res.end();}
 try {
  let data=mode==='old'?old[name]:fs.readFileSync(path.join(root,name));
  if(!data){res.writeHead(404);return res.end();}
  if(mode==='next'&&name==='sw.js')data=Buffer.from(data+'\n// Integration-test update fixture\n');
  if(mode==='next'&&name==='release-manifest.js')data=Buffer.from(data.toString().replace(release.id,release.id+'-next'));
  if(fault==='mixed'&&name==='src/content.js'&&isAssetFetch){blockedRequests++;data=Buffer.concat([data,Buffer.from('\n// wrong release bytes\n')]);}
  res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':'text/html','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
let browser,base;
async function fresh(){const context=await browser.newContext({viewport:{width:390,height:844}});return {context,page:await context.newPage()};}
async function ready(page){await page.waitForFunction(()=>document.querySelector('#offline')?.textContent==='Offline-Dateien bereit',{},{timeout:15000});}
async function update(page){await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});}
(async()=>{
 const current=await import('../src/content.js');
 const html=old['index.html'].toString();
 const baseline=vm.runInNewContext(html.slice(html.indexOf('const subjects='),html.indexOf('let state='))+';({subjects,lessons,questions})');
 for(let i=0;i<baseline.lessons.length;i++) {
  const a=baseline.lessons[i],b=current.lessons[i];
  for(const [expected,actual] of [[a.title,b.title.de],[a.pl,b.title.pl],[a.de,b.paragraphs.de],[a.pltext,b.paragraphs.pl],[a.terms,b.terms]])assert.equal(JSON.stringify(actual),JSON.stringify(expected));
 }
 for(let i=0;i<baseline.questions.length;i++) {
  const a=baseline.questions[i],b=current.questions[i];
  assert.equal(b.text.de,a.q);assert.equal(b.text.pl,a.pl);assert.equal(b.explanation.de,a.why);
  assert.equal(JSON.stringify(b.options.map(o=>o.text.de)),JSON.stringify(a.o));assert.equal(b.correctId,b.options[a.correct].id);
 }
 assert.equal(JSON.stringify(current.subjects.map(s=>s.description.de)),JSON.stringify(baseline.subjects.map(s=>s[2])));
 console.log('PASS: exact original lesson, glossary, question, answer and subject-description preservation');
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}/pilot-academy/`;
 await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['tests/browser.cjs'],{cwd:root,env:{...process.env,PILOT_TEST_URL:base,PILOT_CHROMIUM_PATH:process.env.PILOT_CHROMIUM_PATH||'/usr/bin/chromium'},stdio:'inherit'});p.on('exit',code=>code===0?resolve():reject(Error('Existing browser tests failed')));});
 browser=await chromium.launch({executablePath:process.env.PILOT_CHROMIUM_PATH||'/usr/bin/chromium',headless:true});
 // A broken entry graph must never erase the static bilingual recovery UI.
 {
  fault='module';const {context,page}=await fresh();await page.goto(base);
  await page.locator('#startup-status[role="alert"]').waitFor();
  assert.match(await page.locator('#startup').innerText(),/Erneut versuchen/);
  assert.match(await page.locator('#startup').innerText(),/Spróbuj ponownie/);
  fault=null;await page.locator('#startup-retry').click();await ready(page);
  assert.equal(await page.locator('#startup').isVisible(),false);
  console.log('PASS: missing module → bilingual recovery → retry → usable app');await context.close();
 }
 // Disabled JavaScript still shows recovery instructions.
 {
  const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();await page.goto(base);
  assert.match(await page.locator('#startup').innerText(),/JavaScript/);await context.close();
  console.log('PASS: JavaScript disabled → visible fallback');
 }
 // Failed worker installation is visible, bilingual and recoverable.
 {
  fault='install';const {context,page}=await fresh();await page.goto(base);
  await page.getByRole('button',{name:'Offline-Installation erneut versuchen',exact:true}).waitFor();
  assert.equal(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration())?.active),false);
  await page.locator('nav [data-value="settings"]').click();await page.getByRole('button',{name:'Polski',exact:true}).click();
  await page.getByRole('button',{name:'Ponów instalację offline',exact:true}).waitFor();
  fault=null;await page.getByRole('button',{name:'Ponów instalację offline',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#offline')?.textContent==='Pliki offline gotowe');
  assert.equal(await page.getByRole('button',{name:'Ponów instalację offline',exact:true}).count(),0);
  console.log('PASS: failed precache → localized error → retry → offline ready');await context.close();
 }
 // The manifest and focus follow the language; background events preserve focus.
 {
  const {context,page}=await fresh();await page.goto(base);await ready(page);
  await page.locator('nav [data-value="book"]').click();
  assert.equal(await page.evaluate(()=>document.activeElement.tagName),'H1');
  await page.locator('[data-action="lesson"][data-value="lesson-1"]').click();
  await page.getByRole('button',{name:'Polski',exact:true}).click();
  assert.equal(await page.locator('link[rel="manifest"]').getAttribute('href'),'./manifest.pl.webmanifest');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.value),'pl');
  await page.getByRole('button',{name:'Deutsch',exact:true}).click();
  await page.locator('nav [data-value="quiz"]').click();await page.locator('.options [data-value="answer-1"]').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'quiz-feedback');
  await context.setOffline(true);assert.equal(await page.evaluate(()=>document.activeElement.id),'quiz-feedback');
  await page.getByRole('button',{name:'Nächste Frage'}).click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'question-title');await context.setOffline(false);
  // Missing cached files are repaired without touching progress.
  const before=await page.evaluate(()=>localStorage.getItem('pilot-academy-state'));
  await page.evaluate(async()=>{for(const key of await caches.keys()){const c=await caches.open(key);for(const req of await c.keys())if(new URL(req.url).pathname.endsWith('/src/content.js'))await c.delete(req);}});
  await page.locator('nav [data-value="settings"]').click();await page.getByRole('button',{name:'Offline-Dateien und Updates prüfen',exact:true}).click();await ready(page);
  assert.equal(await page.evaluate(()=>localStorage.getItem('pilot-academy-state')),before);
  console.log('PASS: focus, background events, localized manifest, evicted-cache repair and unchanged progress');await context.close();
 }
 // A broken cached entry graph must still discover a waiting recovery update.
 {
  const {context,page}=await fresh();await page.goto(base);await ready(page);
  await page.evaluate(async()=>{for(const key of await caches.keys()){const cache=await caches.open(key);for(const req of await cache.keys())if(new URL(req.url).pathname.endsWith('/src/ui.js'))await cache.delete(req);}});
  mode='next';fault='oneModule';
  await page.reload();
  await page.getByText('Ein Update ist bereit. Schließe alle Ansichten der Pilot Academy und öffne sie erneut. Keine Website-Daten löschen.',{exact:true}).waitFor();
  assert.equal(await page.locator('#startup').isVisible(),true);
  await context.close();mode='new';fault=null;
  console.log('PASS: failed installed module graph still discovers a recovery update without app startup');
 }
 // Simulate exactly the original Git commit, including its original worker/cache.
 {
  mode='old';const {context,page}=await fresh();await page.goto(base);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
  const progress={lang:'pl',currentLesson:2,done:[0,2],score:7,attempts:9};
  await page.evaluate(p=>localStorage.setItem('pilot-academy-state',JSON.stringify(p)),progress);await page.reload();
  mode='new';await update(page);await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting);
  assert.match(await page.locator('#view').innerText(),/Schritt für Schritt/);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pilot-academy-state')).score),7);
  await page.close();const next=await context.newPage();await next.goto(base);
  await next.waitForFunction(async()=>!(await navigator.serviceWorker.getRegistration()).waiting);await next.reload();
  await next.getByRole('button',{name:'Kontynuuj naukę'}).click();await next.getByRole('heading',{name:'Prędkość względem ziemi',exact:true}).waitFor();
  const migrated=await next.evaluate(()=>JSON.parse(localStorage.getItem('pilot-academy-state')));
  assert.equal(migrated.score,7);assert.equal(migrated.attempts,9);assert.deepEqual(migrated.done,['lesson-1','lesson-3']);assert.equal(migrated.currentLessonId,'lesson-3');
  assert.equal((await next.evaluate(()=>caches.keys())).includes('pilot-academy-v1'),false);
  await context.setOffline(true);await next.reload();await next.getByRole('button',{name:'Kontynuuj naukę'}).waitFor();await context.setOffline(false);
  console.log('PASS: original GitHub commit → waiting → close/reopen → migration and offline restart');
  // A bad update must leave the working installation and its progress untouched.
  const snapshot=await next.evaluate(()=>localStorage.getItem('pilot-academy-state'));
  mode='next';fault='mixed';await update(next);
  await next.getByRole('button',{name:'Ponów instalację offline',exact:true}).waitFor();
  assert.equal(await next.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),false);
  assert.equal(await next.evaluate(()=>localStorage.getItem('pilot-academy-state')),snapshot);
  fault=null;await next.getByRole('button',{name:'Ponów instalację offline',exact:true}).click();
  await next.getByText('Aktualizacja aplikacji została w całości pobrana i czeka na aktywację.',{exact:true}).waitFor();
  await next.locator('nav [data-value="settings"]').click();await next.getByRole('button',{name:'Deutsch',exact:true}).click();
  await next.getByText('Ein App-Update wurde vollständig heruntergeladen und wartet auf Aktivierung.',{exact:true}).waitFor();
  assert.equal(await next.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),true);
  console.log('PASS: mixed release rejected, working cache/progress preserved, retry and waiting-update notice in DE/PL');await context.close();mode='new';
 }
 assert.ok(blockedRequests>=3);
 assert.ok(hits.some(h=>h.name==='src/app.js'&&h.query==='?v=1.1.0'));
 console.log(`ALL RELEASE CHECKS PASSED (${release.id})`);
})().catch(e=>{console.error(e);console.error('Recent module requests:',hits.filter(hit=>hit.name==='src/ui.js').slice(-12));process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
