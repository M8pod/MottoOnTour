const CACHE_NAME = 'motto-on-tour-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './favicon-32x32.png',
  './favicon-16x16.png',
  './favicon.ico',
  './app-logo.png',
  './css/leaflet.css?v=1.8.1',
  './css/style.css?v=1.8.1',
  './js/leaflet.js?v=1.8.1',
  './js/world-geo.js?v=1.8.1',
  './js/leaflet-image.js?v=1.8.1',
  './js/jspdf.umd.min.js?v=1.8.1',
  './js/jspdf.plugin.autotable.min.js?v=1.8.1',
  './js/config.js?v=1.8.1',
  './js/audio.js?v=1.8.1',
  './js/geo.js?v=1.8.1',
  './js/api.js?v=1.8.1',
  './js/pdf.js?v=1.8.1',
  './js/app.js?v=1.8.1',
  './js/modules/home/home.js?v=1.8.1',
  './js/modules/diario/diario.js?v=1.8.1',
  './js/modules/passaporto/passaporto.js?v=1.8.1',
  './js/modules/sfide/sfide.js?v=1.8.1',
  './js/modules/mappe/mappe.js?v=1.8.1',
  './js/modules/in-partenza/in-partenza.js?v=1.8.1',
  './js/modules/cassetto/cassetto.js?v=1.8.1',
  './js/modules/impostazioni/impostazioni.js?v=1.8.1'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Let Google Apps Script API and map tiles pass through network
  if (
    event.request.url.includes('script.google.com') ||
    event.request.url.includes('script.googleusercontent.com') ||
    event.request.url.includes('cartocdn.com') ||
    event.request.url.includes('openstreetmap.org')
  ) {
    return;
  }

  // For HTML navigation requests: Network first, fallback to cached index.html if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // For static assets: Cache first with background update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
