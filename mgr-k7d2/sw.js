const CACHE='mgr-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x.startsWith('mgr-')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  e.respondWith(fetch(r, u_origin(r)?{cache:'no-cache'}:undefined).then(res=>{
    if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined))));
});
function u_origin(r){try{return new URL(r.url).origin===location.origin;}catch(_){return false;}}
