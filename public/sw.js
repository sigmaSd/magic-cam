// Cache requests so the app can work offline
// Uncomment to enable caching
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
const cacheName = "myapp-v1";

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      try {
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      } catch {
        const response = await caches.match(e.request);
        console.log(`[Service Worker] Using cached resource: ${e.request.url}`);
        if (response) {
          return response;
        }
      }
    })(),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});
