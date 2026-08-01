const CACHE = "bear-workbench-v44";
const OFFLINE_ASSETS = ["/manifest.webmanifest?v=44", "/icons/icon-192.png?v=44", "/icons/icon-512.png?v=44", "/icons/apple-touch-icon.png?v=44", "/bears/v2/bear-heart.png", "/bears/v2/bear-reading.png", "/bears/v2/bear-ribbon.png"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request, {cache:"no-store"}).then((response)=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put("/offline-page",copy));return response}).catch(()=>caches.match("/offline-page")));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached)=>cached||fetch(event.request).then((response)=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
