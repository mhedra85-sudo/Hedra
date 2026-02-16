// Hedra V6.1 PRO – Service Worker (GitHub Pages safe)
const CACHE="hedra-v6-1-pro-fixed-20260216";

// Cache relative to current scope (works for /Hedra/ path)
const SCOPE = self.registration.scope; // e.g. https://user.github.io/Hedra/
const CORE = [
  new URL("./", SCOPE).pathname,
  new URL("./index.html", SCOPE).pathname,
  new URL("./manifest.json", SCOPE).pathname,
  new URL("./icon.png", SCOPE).pathname
];

self.addEventListener("install", e => {
  e.waitUntil((async()=>{
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;

  e.respondWith((async()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    try{
      const fresh = await fetch(req);
      if(req.method==="GET") cache.put(req, fresh.clone());
      return fresh;
    }catch(_){
      if(cached) return cached;
      if(req.mode==="navigate"){
        return (await cache.match(new URL("./index.html", SCOPE).pathname)) || new Response("Offline",{status:503});
      }
      return new Response("Offline",{status:503});
    }
  })());
});
