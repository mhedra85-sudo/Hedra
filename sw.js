const CACHE="hedra-v6-teacher-20260214015150";
const CORE=["./","./index.html","./manifest.json","./icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))); self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener("fetch",e=>{
  const req=e.request; const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(req);
    const net=fetch(req).then(res=>{cache.put(req,res.clone()); return res;}).catch(()=>null);
    if(cached) return cached;
    const fresh=await net;
    if(fresh) return fresh;
    if(req.mode==="navigate") return (await cache.match("./index.html")) || new Response("Offline",{status:503});
    return new Response("Offline",{status:503});
  })());
});
