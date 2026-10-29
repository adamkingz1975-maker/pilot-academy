// Run with Playwright installed: node tests/browser.cjs
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.PILOT_TEST_URL || 'http://127.0.0.1:8000/';
async function run(engine, name) {
 const browser=await engine.launch({headless:true, ...(name==='Chromium' && process.env.PILOT_CHROMIUM_PATH ? {executablePath:process.env.PILOT_CHROMIUM_PATH}: {})});
 try {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.evaluate(()=>localStorage.setItem('pilot-academy-state',JSON.stringify({lang:'de',done:[0,2],currentLesson:2,attempts:3,score:2})));
  await page.reload();
  await page.getByRole('button',{name:'Lernen fortsetzen'}).click();
  await page.getByRole('heading',{name:'Geschwindigkeit über Grund',exact:true}).waitFor();
  await page.getByRole('button',{name:'Polski',exact:true}).click();
  await page.getByRole('heading',{name:'Prędkość względem ziemi',exact:true}).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'),'pl');
  await page.getByRole('button',{name:'Rozdział przeczytany'}).click();
  const order=await page.locator('.options button').evaluateAll(bs=>bs.map(b=>b.dataset.value));
  await page.locator('.options [data-value="answer-1"]').click();
  await page.getByText('Dobrze!',{exact:true}).waitFor();
  assert.equal(await page.locator('.options button:disabled').count(),3);
  await page.locator('nav [data-value="settings"]').click();
  await page.getByRole('button',{name:'Deutsch',exact:true}).click();
  await page.getByRole('button',{name:'Polen',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('lang'),'de');
  await page.getByRole('button',{name:'Polski',exact:true}).click();
  await page.getByRole('button',{name:'Polska',exact:true}).waitFor();
  await page.getByRole('button',{name:'Deutsch',exact:true}).click();
  await page.locator('nav [data-value="quiz"]').click();
  assert.deepEqual(await page.locator('.options button').evaluateAll(bs=>bs.map(b=>b.dataset.value)),order);
  await page.getByText('Richtig!',{exact:true}).waitFor();
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('pilot-academy-state')));
  assert.equal(progress.trainingCountry,'PL');assert.equal(progress.attempts,4);assert.equal(progress.score,3);assert.equal(progress.done.length,2);
  await page.getByRole('button',{name:'Nächste Frage'}).click();
  await page.locator('.options [data-value="answer-2"]').click();
  await page.getByText('Noch nicht ganz.',{exact:true}).waitFor();
  await page.waitForFunction(()=>document.querySelector('#offline').textContent==='Offline-Dateien bereit').catch(async error=>{
   console.error('Offline diagnostic:',await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {badge:document.querySelector('#offline')?.textContent,active:r?.active?.state,installing:r?.installing?.state,waiting:r?.waiting?.state,controller:!!navigator.serviceWorker.controller,caches:await caches.keys()};}));throw error;
  });
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button',{name:'Lernen fortsetzen'}).waitFor();
  await page.locator('nav [data-value="book"]').click();
  assert.equal(await page.locator('#view [data-action="lesson"]').count(),4);
  for(let i=1;i<=4;i++) {
   await page.locator(`[data-action="lesson"][data-value="lesson-${i}"]`).click();
   await page.locator('.lesson-content p').first().waitFor();
   await page.getByRole('button',{name:'Polski',exact:true}).click();
   await page.getByRole('button',{name:'Deutsch',exact:true}).click();
   await page.locator('[data-action="tab"][data-value="book"]').last().click();
  }
  await page.locator('nav [data-value="quiz"]').click();
  for(let i=0;i<6;i++) {
   await page.locator('.options [data-value="answer-1"]').click();
   await page.getByText('Richtig!',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Nächste Frage'}).click();
  }
  await context.setOffline(false);
  await page.evaluate(()=>localStorage.setItem('pilot-academy-state','{broken'));
  await page.reload();
  await page.locator('#app .notice[role="status"]').waitFor();
  await page.locator('nav [data-value="subjects"]').click();
  assert.equal(await page.locator('#view [data-action="subject"]').count(),9);
  await page.locator('nav [data-value="settings"]').click();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Fortschritt löschen',exact:true}).click();
  await page.getByRole('button',{name:'Lernen fortsetzen'}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('pilot-academy-state')),null);
  await page.evaluate(()=>localStorage.setItem('pilot-academy-state','{"version":99}'));
  await page.reload();
  await page.locator('#app .notice[role="status"]').waitFor();
  await page.locator('nav [data-value="settings"]').click();
  await page.getByRole('button',{name:'Polski',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pilot-academy-state')).version),99);
  assert.deepEqual(errors,[]);
  const blocked=await browser.newContext();
  await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}}));
  const blockedPage=await blocked.newPage();
  await blockedPage.goto(base);
  await blockedPage.locator('#app .notice[role="status"]').waitFor();
  await blockedPage.locator('nav [data-value="settings"]').click();
  await blockedPage.getByRole('button',{name:'Polski',exact:true}).click();
  assert.equal(await blockedPage.locator('html').getAttribute('lang'),'pl');
  await blocked.close();
  await context.close();
  console.log(name+': migration, languages, scoring, navigation, corrupt storage, offline reload, mobile width PASS');
 } finally {await browser.close();}
}
(async()=>{await run(chromium,'Chromium');if(process.env.PILOT_TEST_WEBKIT==='1') await run(webkit,'WebKit'); else console.log('WebKit: not run (set PILOT_TEST_WEBKIT=1 when installed)');})().catch(e=>{console.error(e);process.exitCode=1});
