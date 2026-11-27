const CACHE='mgr-v13';
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

self.addEventListener('push',e=>{
  let d={}; try{d=e.data?e.data.json():{};}catch(_){d={title:'سوهاج الجديدة',body:e.data?e.data.text():''};}
  e.waitUntil(self.registration.showNotification(d.title||'سوهاج الجديدة',{body:d.body||'',icon:'./icon-192.png',badge:'./badge-96.png',dir:'rtl',lang:'ar',tag:d.tag||'admin',renotify:true,vibrate:[200,100,200,100,300],requireInteraction:true,data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope);
  const go=url.searchParams.get('go')||'';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cl=>{
    for(const c of cl){ if(c.url.startsWith(self.registration.scope)&&'focus' in c){ c.postMessage({type:'admin-go',go}); return c.focus(); } }
    return self.clients.openWindow(url.href);
  }));
});
