// Redirect regressions and recovery. Only temporary browser profiles and loopback HTTP.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),oldCommit='85c17447832f7a0a3e5bf3cc7390227a9bbddb9c';
const old={};for(const name of execFileSync('git',['ls-tree','-r','--name-only',oldCommit],{cwd:root,encoding:'utf8'}).trim().split('\n')) {
 if(['index.html','sw.js','release-manifest.js','release.json','styles.css','manifest.webmanifest','manifest.pl.webmanifest','icon-192.png','icon-512.png'].includes(name)||name.startsWith('src/'))old[name]=execFileSync('git',['show',oldCommit+':'+name],{cwd:root});
}
let mode='new',prefix='/',code=308,canonicalRedirect=false,blockRecovery=false;
let indexHits=0;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith(prefix)){res.writeHead(404);return res.end();}
 let name=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
 if(name.includes('..')){res.writeHead(404);return res.end();}
 if(url.pathname===prefix+'redirect-probe'){res.writeHead(code,{Location:prefix,'Cache-Control':'no-store'});return res.end();}
 if(url.pathname===prefix+'index.html'){indexHits++;res.writeHead(code,{Location:prefix,'Cache-Control':'no-store'});return res.end();}
 if(url.pathname===prefix&&canonicalRedirect&&req.headers['sec-fetch-dest']==='empty'){res.writeHead(302,{Location:prefix+'landing/','Cache-Control':'no-store'});return res.end();}
 if(name==='landing/')name='index.html';
 if(name.startsWith('recovery')&&blockRecovery){res.writeHead(503);return res.end();}
 if(name.endsWith('/'))name+='index.html';
 try{
  // Recovery page is newly deployed beside the old app before updating its worker.
  const bytes=mode==='old'&&!name.startsWith('recovery/')?old[name]:fs.readFileSync(path.join(root,name));
  if(!bytes){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':'text/html','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
let browser,origin;
async function ready(page){await page.waitForFunction(()=>document.querySelector('#offline')?.textContent==='Offline-Dateien bereit',null,{timeout:15000});}
async function create(){const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});return {context,page:await context.newPage()};}
async function rootCache(page){return page.evaluate(async()=>{const result=[];for(const key of await caches.keys()){const c=await caches.open(key);for(const req of await c.keys()){const r=await c.match(req);if(r.headers.get('content-type')?.includes('text/html'))result.push({key:req.url,redirected:r.redirected,url:r.url,status:r.status,type:r.type});}}return result;});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.PILOT_CHROMIUM_PATH||'/usr/bin/chromium',headless:true});
 for(const hostPath of ['/','/pilot-academy/']) {
  prefix=hostPath;
  for(const status of [301,302,307,308]) {
   code=status;indexHits=0;const {context,page}=await create();
   const raw=await context.request.get(origin+prefix+'index.html',{maxRedirects:0});assert.equal(raw.status(),status);indexHits=0;
   await page.goto(origin+prefix);await ready(page);assert.equal(indexHits,0,'precache must never fetch index.html');
   const snapshot=JSON.stringify({version:1,lang:'de',trainingCountry:'PL',currentLessonId:'lesson-3',done:['lesson-1','lesson-3'],score:7,attempts:9});
   await page.evaluate(value=>localStorage.setItem('pilot-academy-state',value),snapshot);
   await page.close();const next=await context.newPage();
   for(const suffix of ['', '?diagnose=1','index.html','index.html?diagnose=1']){
    await next.goto(origin+prefix+suffix);await next.getByRole('button',{name:'Lernen fortsetzen'}).waitFor();
    assert.equal(await next.evaluate(()=>localStorage.getItem('pilot-academy-state')),snapshot);
   }
   const cache=await rootCache(next);assert.ok(cache.length>=2);assert.ok(cache.every(r=>!r.redirected&&r.status===200));assert.ok(!cache.some(r=>new URL(r.key).pathname.endsWith('index.html')));
   if(status===308) {
    const redirected=await next.evaluate(async()=>{
     const bad=await fetch(new URL('redirect-probe',location.href));
     for(const key of await caches.keys()){const c=await caches.open(key);if(await c.match(new URL('./',location.href).href))await c.put(new URL('./',location.href).href,bad.clone());}
     return bad.redirected;
    });assert.equal(redirected,true);
    const readyFlag=await next.evaluate(()=>new Promise(resolve=>{
     const listener=event=>{if(event.data?.type==='OFFLINE_STATUS'){navigator.serviceWorker.removeEventListener('message',listener);resolve(event.data.ready);}};
     navigator.serviceWorker.addEventListener('message',listener);navigator.serviceWorker.controller.postMessage({type:'CHECK_OFFLINE'});
    }));assert.equal(readyFlag,false);
    await next.reload();await ready(next);assert.ok((await rootCache(next)).every(r=>!r.redirected));
    assert.equal(await next.evaluate(()=>localStorage.getItem('pilot-academy-state')),snapshot);
    console.log(`PASS ${prefix}: redirected response injected into cache → offline readiness rejected → online repair`);
   }
   await context.setOffline(true);
   for(const suffix of ['', '?diagnose=1','index.html']){await next.goto(origin+prefix+suffix);await next.getByRole('button',{name:'Lernen fortsetzen'}).waitFor();}
   await next.goto(origin+prefix+'recovery/');await next.getByRole('button',{name:'Lernfortschritt sichern / Zapisz kopię postępów'}).waitFor();
   const download=next.waitForEvent('download');await next.locator('#backup').click();assert.equal((await download).suggestedFilename(),'Pilot-Academy-Fortschritt-Sicherung.json');
   assert.equal(await next.evaluate(()=>localStorage.getItem('pilot-academy-state')),snapshot);
   // Offline repair cannot download files, but it must not mutate progress.
   await next.locator('#update').click();await next.waitForFunction(()=>document.querySelector('#update').disabled===false);
   assert.equal(await next.evaluate(()=>localStorage.getItem('pilot-academy-state')),snapshot);
   await context.close();console.log(`PASS ${prefix} redirect ${status}: first load, restart, aliases, queries, offline recovery/backup and unchanged progress`);
  }
  // A canonical URL that itself redirects is not a valid release asset.
  canonicalRedirect=true;const broken=await create();await broken.page.goto(origin+prefix);
  await broken.page.getByRole('button',{name:'Offline-Installation erneut versuchen',exact:true}).waitFor();
  assert.equal(await broken.page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration())?.active),false);
  await broken.context.close();canonicalRedirect=false;console.log(`PASS ${prefix}: redirected canonical HTML rejected`);
  // Reproduce the actual 1.1 cache fault, then repair from the independent page.
  mode='old';code=308;const {context,page}=await create();await page.goto(origin+prefix);await ready(page);
  const progress=JSON.stringify({version:1,lang:'de',trainingCountry:'PL',currentLessonId:'lesson-3',done:['lesson-1','lesson-3'],score:7,attempts:9});
  await page.evaluate(value=>localStorage.setItem('pilot-academy-state',value),progress);
  const bad=await rootCache(page);assert.ok(bad.some(r=>r.redirected&&new URL(r.key).pathname.endsWith('/index.html')));
  // Intentionally keep the old browser page alive: no automatic navigation-triggered update yet.
  const probe=await context.newPage();let failed=false;try{await probe.goto(origin+prefix+'?diagnose=1',{timeout:10000});}catch{failed=true;}assert.equal(failed,true);await probe.close();
  // Old worker passes recovery through; absence/offline cannot be bypassed magically.
  blockRecovery=true;let recovery=await context.newPage();let unavailable=false;try{const response=await recovery.goto(origin+prefix+'recovery/');unavailable=response.status()===503;}catch{unavailable=true;}assert.equal(unavailable,true);assert.equal(await page.evaluate(()=>localStorage.getItem('pilot-academy-state')),progress);blockRecovery=false;
  await recovery.close();recovery=await context.newPage();mode='new';await recovery.goto(origin+prefix+'recovery/');await recovery.locator('#update').click();
  await recovery.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Update bereit.'),null,{timeout:15000});
  assert.equal(await recovery.evaluate(()=>localStorage.getItem('pilot-academy-state')),progress);
  assert.equal(await recovery.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),true);
  await page.close();await recovery.close();
  const repaired=await context.newPage();await repaired.goto(origin+prefix);await repaired.getByRole('button',{name:'Lernen fortsetzen'}).waitFor();await ready(repaired);
  assert.equal(await repaired.evaluate(()=>localStorage.getItem('pilot-academy-state')),progress);
  assert.ok((await rootCache(repaired)).every(r=>!r.redirected));
  await context.setOffline(true);await repaired.reload();await repaired.getByRole('button',{name:'Lernen fortsetzen'}).waitFor();
  await context.close();console.log(`PASS ${prefix}: 1.1 redirect failure reproduced → recovery page → waiting update → close/reopen → 1.1.1 offline, progress unchanged`);
 }
 console.log('ALL REDIRECT AND RECOVERY TESTS PASSED');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
