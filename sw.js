const CACHE='sohag-v34';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.includes('autocad.com')||u.hostname.includes('youtube.com'))return;
  e.respondWith(fetch(r, u.origin===location.origin ? {cache:'no-cache'} : undefined).then(res=>{
    if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined))));
});

self.addEventListener('push',e=>{
  let d={}; try{d=e.data?e.data.json():{};}catch(_){d={title:'سوهاج الجديدة',body:e.data?e.data.text():''};}
  const title=d.title||'سوهاج الجديدة';
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    cl.forEach(c=>c.postMessage({type:'new-listing',body:d.body}));
    await self.registration.showNotification(title,{body:d.body||'',icon:'./icon-192.png',badge:'./icon-192.png',dir:'rtl',lang:'ar',tag:d.tag||'listing',renotify:true,vibrate:[120,80,120,80,260],requireInteraction:false,data:{url:d.url||'./'}});
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cl=>{
    for(const c of cl){ if(c.url.startsWith(self.registration.scope)&&'focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
