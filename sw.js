importScripts('./release-manifest.js?v=1.1.1');
const RELEASE = self.PILOT_RELEASE;
const PREFIX = `pilot-academy-${encodeURIComponent(self.registration.scope)}-`;
const CACHE = `${PREFIX}${RELEASE.id}`;
const ASSETS = RELEASE.assets;
const absolute = path => new URL(path,self.registration.scope).href;
const htmlAsset = asset => asset.url === './' || asset.url === './recovery/';
async function checksum(response) {
  const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}
function navigationResponse(response) {
  // A synthetic response has neither a redirect chain nor a foreign final URL.
  // fetch() already decoded the body, so transport encoding/length must not survive.
  const headers=new Headers(response.headers);
  for(const name of ['content-encoding','content-length','transfer-encoding','location']) headers.delete(name);
  return new Response(response.clone().body,{status:200,headers});
}
async function verifiedResponse(asset) {
  const response=await fetch(new Request(absolute(asset.url),{cache:'reload',credentials:'same-origin',redirect:'error'}));
  if(response.status!==200 || response.type==='opaque' || response.type==='opaqueredirect' || response.redirected || response.url!==absolute(asset.url)) throw Error('Unexpected release response');
  if(htmlAsset(asset) && !/^text\/html(?:;|$)/i.test(response.headers.get('content-type') || '')) throw Error('Expected HTML');
  if(await checksum(response)!==asset.sha256) throw Error('Mixed release files');
  return htmlAsset(asset)?navigationResponse(response):response;
}
async function verifiedAssets() {
  // Validate the entire release before changing the cache. Redirects are rejected.
  return Promise.all(ASSETS.map(async asset=>[absolute(asset.url),await verifiedResponse(asset)]));
}
async function installAssets() {
  const entries=await verifiedAssets();
  const cache=await caches.open(CACHE);
  await Promise.all(entries.map(([url,response])=>cache.put(url,response)));
}
async function offlineReady() {
  const cache=await caches.open(CACHE);
  const valid=await Promise.all(ASSETS.map(async asset=>{
    const response=await cache.match(absolute(asset.url));
    if(!response || response.status!==200 || response.redirected || ['opaque','opaqueredirect'].includes(response.type)) return false;
    if(htmlAsset(asset) && !/^text\/html(?:;|$)/i.test(response.headers.get('content-type') || '')) return false;
    return await checksum(response)===asset.sha256;
  }));
  return valid.every(Boolean);
}
self.addEventListener('install',event=>{
  // Never skipWaiting: the old version keeps its matching files until closed.
  event.waitUntil(installAssets().catch(async error=>{
    await caches.delete(CACHE);throw error;
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()) {
      if(key!==CACHE&&(key.startsWith(PREFIX)||/^pilot-academy-v\d+$/.test(key))) {
        const cache=await caches.open(key);
        if(await cache.match(absolute('./')) || await cache.match(absolute('./index.html'))) await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(!['CHECK_OFFLINE','RETRY_OFFLINE'].includes(event.data?.type))return;
  event.waitUntil((async()=>{
    try {
      if(event.data.type==='RETRY_OFFLINE') await installAssets();
      event.source?.postMessage({type:'OFFLINE_STATUS',ready:await offlineReady(),release:RELEASE.id});
    }catch{event.source?.postMessage({type:'OFFLINE_STATUS',ready:false,release:RELEASE.id});}
  })());
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const home=new URL('./',self.registration.scope).pathname;
    const recovery=new URL('./recovery/',self.registration.scope).pathname;
    let key=url.href;
    if(event.request.mode==='navigate') {
      if([home,home+'index.html'].includes(url.pathname))key=absolute('./');
      if([recovery,recovery+'index.html',recovery.slice(0,-1)].includes(url.pathname))key=absolute('./recovery/');
    }
    const asset=ASSETS.find(asset=>absolute(asset.url)===key);
    if(!asset)return fetch(event.request);
    try {
      let response=await cache.match(key);
      // Never return an inherited redirected response, even after cache corruption.
      if(!response || response.redirected || response.status!==200 || ['opaque','opaqueredirect'].includes(response.type) || await checksum(response)!==asset.sha256) {
        response=await verifiedResponse(asset);await cache.put(key,response.clone());
      }
      return htmlAsset(asset)?navigationResponse(response):response;
    } catch {
      if(htmlAsset(asset))return new Response('<!doctype html><html lang="de"><meta charset="utf-8"><title>Pilot Academy</title><h1>Pilot Academy</h1><p>Startdateien nicht verfügbar. Bitte online erneut versuchen oder die Wiederherstellung öffnen. Keine Website-Daten löschen.</p><p lang="pl">Pliki startowe są niedostępne. Spróbuj ponownie online lub otwórz stronę odzyskiwania. Nie usuwaj danych witryny.</p><a href="'+absolute('./recovery/')+'">Wiederherstellung / Odzyskiwanie</a></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
      return new Response('Release asset unavailable',{status:503});
    }
  })());
});
