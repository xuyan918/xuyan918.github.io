const CACHE = "bear-workbench-v56";
const APP_SHELL = "/bear-workbench-app-shell";
const OFFLINE_ASSETS = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png", "/bears/v2/bear-heart.png", "/bears/v2/bear-profile.png"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)).then(async()=>{const cache=await caches.open(CACHE);const shell=await cache.match("/");if(shell)await cache.put(APP_SHELL,shell.clone())}).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(APP_SHELL);
      const network=fetch(event.request,{cache:"no-store"}).then(async response=>{if(response.ok)await cache.put(APP_SHELL,response.clone());return response}).catch(()=>null);
      if(cached){event.waitUntil(network);return cached}
      return await network||Response.error();
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then((cached)=>cached||fetch(event.request).then((response)=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
