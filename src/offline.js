// No unregister(), storage reset or forced activation: existing sessions stay intact.
export function createOfflineManager(onChange, timeoutMs = 20000) {
  const status = {ready:false, failed:false, installing:false, waiting:false};
  let registration, timer, generation=0;
  const observed = new WeakSet();
  const emit = () => onChange({...status});
  const fail = () => { clearTimeout(timer); status.failed=true; status.installing=false; emit(); };
  function deadline() { clearTimeout(timer); timer=setTimeout(fail,timeoutMs); }
  function check() {
    const worker=registration?.active;
    if (!worker || worker.state !== 'activated') return;
    deadline();
    worker.postMessage({type:'CHECK_OFFLINE'});
  }
  function observe(worker) {
    if (!worker || observed.has(worker)) return;
    observed.add(worker);
    const wasActive = worker === registration.active;
    const changed = () => {
      status.waiting=Boolean(registration.waiting);
      if (worker.state==='installing') { status.installing=true; status.failed=false; deadline(); }
      if (worker.state==='installed') {
        clearTimeout(timer); status.installing=false; status.failed=false;
        status.waiting=Boolean(registration.waiting);
        if (status.waiting) status.failed=false;
      }
      if (worker.state==='redundant') {
        if (wasActive && registration.active && registration.active !== worker) { check(); return; }
        fail(); return;
      }
      if (worker.state==='activated') { status.failed=false; check(); }
      emit();
    };
    worker.addEventListener('statechange',changed); changed();
  }
  async function start() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) { fail(); return; }
    const run=++generation;
    status.failed=false; status.installing=true; emit(); deadline();
    try {
      const result=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      if (run!==generation) return;
      registration=result;
      registration.addEventListener('updatefound',()=>observe(registration.installing));
      status.waiting=Boolean(registration.waiting);
      observe(registration.installing); observe(registration.waiting); observe(registration.active);
      if (registration.active && !registration.installing) { status.installing=false; check(); }
      emit();
    } catch { if(run===generation) fail(); }
  }
  async function retry() {
    status.failed=false; status.installing=true; emit(); deadline();
    try {
      if (!registration?.active) { await start(); return; }
      await registration.update();
      if (registration.installing) { observe(registration.installing); return; }
      status.waiting=Boolean(registration.waiting);
      // Repair an evicted cache without clearing progress or replacing the worker.
      registration.active.postMessage({type:'RETRY_OFFLINE'});
    } catch { fail(); }
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange',check);
    navigator.serviceWorker.addEventListener('message',event=>{
      if (event.data?.type!=='OFFLINE_STATUS' || (registration?.active && event.source?.scriptURL!==registration.active.scriptURL)) return;
      clearTimeout(timer);status.ready=event.data.ready===true;if(!status.ready)status.failed=true;status.installing=false;emit();
    });
  }
  window.addEventListener('online',()=>{ emit(); if (registration?.active) check(); });
  window.addEventListener('offline',emit);
  return {start,retry};
}
