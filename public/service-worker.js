const CACHE = "bear-workbench-v24";
const ASSETS = ["/", "/manifest.webmanifest?v=3", "/icons/icon-192.png?v=3", "/icons/icon-512.png?v=3", "/icons/apple-touch-icon.png?v=3", "/bears/v2/bear-heart.png", "/bears/v2/bear-reading.png", "/bears/v2/bear-work.png", "/bears/v2/bear-ribbon.png", "/bears/v2/bear-flower.png", "/bears/v2/bear-sleep.png", "/bears/v2/bear-travel.png", "/bears/v2/bear-fitness.png", "/bears/v2/bear-profile.png"];
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
