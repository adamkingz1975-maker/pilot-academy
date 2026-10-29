importScripts('./release-manifest.js?v=1.1.0');
const RELEASE = self.PILOT_RELEASE;
const PREFIX = `pilot-academy-${encodeURIComponent(self.registration.scope)}-`;
const CACHE = `${PREFIX}${RELEASE.id}`;
const ASSETS = RELEASE.assets;
const absolute = path => new URL(path,self.registration.scope).href;
async function verifiedAssets() {
  // Validate the entire release before writing to the active cache.
  return Promise.all(ASSETS.map(async asset => {
    const response=await fetch(new Request(absolute(asset.url),{cache:'reload',credentials:'same-origin'}));
    if (!response.ok || response.type==='opaque') throw Error('Incomplete release');
    const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
    const hex=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
    if(hex!==asset.sha256) throw Error('Mixed release files');
    return [absolute(asset.url),response];
  }));
}
async function installAssets() {
  const entries=await verifiedAssets();
  const cache=await caches.open(CACHE);
  await Promise.all(entries.map(([url,response])=>cache.put(url,response)));
}
async function offlineReady() {
  const cache=await caches.open(CACHE);
  return (await Promise.all(ASSETS.map(asset=>cache.match(absolute(asset.url))))).every(Boolean);
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
        if(await cache.match(absolute('./index.html'))) await caches.delete(key);
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
    // Startup retries can have a query string; retain the installed app offline.
    const request=event.request.mode==='navigate'&&(url.pathname===new URL('./',self.registration.scope).pathname||url.pathname===new URL('./index.html',self.registration.scope).pathname)?absolute('./index.html'):event.request;
    const cached=await cache.match(request);
    if(cached)return cached;
    const requestedURL = typeof request === 'string' ? request : url.href;
    const known=ASSETS.some(asset=>absolute(asset.url)===requestedURL);
    // Do not silently replace an evicted release asset with another release.
    if(known) {
      const asset=ASSETS.find(asset=>absolute(asset.url)===requestedURL);
      try {
        const response=await fetch(new Request(request,{cache:'reload'}));
        const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
        const hex=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
        if(!response.ok||hex!==asset.sha256)throw Error();
        await cache.put(request,response.clone());return response;
      }catch{return new Response('Release asset unavailable',{status:503});}
    }
    return fetch(event.request);
  })());
});
