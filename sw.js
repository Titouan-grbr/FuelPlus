const CACHE='fuelplus-shell-v19-delete-button';
const ASSETS=['./index.html','./manifest.webmanifest','./icon.svg','./app.js','./auth.js','./conditions.html','./confidentialite.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('fuelplus-shell-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;
if(u.pathname.includes('PrixCarburants_'))return;
if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match('./index.html')));return}
e.respondWith(fetch(r).then(resp=>{if(resp.ok&&ASSETS.some(a=>u.pathname.endsWith(a.slice(2)))){const clone=resp.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(r,clone)))}return resp}).catch(()=>caches.match(r)))
});
