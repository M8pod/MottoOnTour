const CACHE_NAME = 'motto-on-tour-v8';
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
  './css/leaflet.css',
  './css/style.css',
  './js/leaflet.js',
  './js/world-geo.js',
  './js/leaflet-image.js',
  './js/jspdf.umd.min.js',
  './js/jspdf.plugin.autotable.min.js',
  './js/config.js',
  './js/audio.js',
  './js/geo.js',
  './js/api.js',
  './js/pdf.js',
  './js/app.js',
  './js/modules/home/home.js',
  './js/modules/diario/diario.js',
  './js/modules/passaporto/passaporto.js',
  './js/modules/sfide/sfide.js',
  './js/modules/mappe/mappe.js',
  './js/modules/in-partenza/in-partenza.js',
  './js/modules/cassetto/cassetto.js',
  './js/modules/impostazioni/impostazioni.js'
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

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
