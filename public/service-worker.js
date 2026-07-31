const CACHE = "bear-workbench-v23";
const ASSETS = ["/", "/manifest.webmanifest?v=2", "/icons/icon-192.png?v=2", "/icons/icon-512.png?v=2", "/icons/apple-touch-icon.png?v=2", "/bears/app-bear.jpg", "/bears/bear-grid.jpg", "/bears/bear-ribbon.jpg", "/bears/bear-trio.jpg"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))));
});
