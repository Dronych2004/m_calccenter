/**
 * Service Worker для PWA
 *
 * HTML uses the network directly; only versioned/static assets are cached.
 */

const CACHE_NAME = 'calccenter-v4';
const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
];

/* Установка: кэшируем статические ресурсы */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* Активация: удаляем старые кэши */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Cache static assets only; navigation is handled by the browser. */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Кэшируем только GET-запросы */
  if (request.method !== 'GET') return;

  // Let the browser handle HTML and redirects directly. Never hide a
  // redirect loop behind a cached home page or persist HTML from an old build.
  if (request.mode === 'navigate') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (!/\.(?:js|css|png|jpe?g|gif|svg|ico|woff2?)$/i.test(new URL(request.url).pathname)) return;

  /* Для статики (JS, CSS, изображения) — Cache First */
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
