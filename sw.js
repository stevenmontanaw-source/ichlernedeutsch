// Ichlernedeutsch offline cache. Bump VERSION after changing any file.
const VERSION='ichlernedeutsch-v4';
const CORE=['./','index.html','manifest.webmanifest','qrcode.js','jsQR.js','icon-192.png','icon-512.png','icon-maskable.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const url=new URL(r.url);
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(VERSION).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit))));
    return;
  }
  if(url.origin!==location.origin) return;
  // opened from the share menu (./?text=...): serve the cached app page
  const key=url.search&&url.pathname.endsWith('/')?new Request(url.pathname):r;
  e.respondWith(caches.open(VERSION).then(c=>c.match(key,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok&&!url.search)c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  })));
});
