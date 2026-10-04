// Progressive Web App Service Worker for Noa AI - Saban WhatsApp PWA
const CACHE_NAME = 'saban-noa-pwa-v2.5';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install: Cache critical shell assets & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache item failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up previous cache versions & claim all clients
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

// Fetch: Network First for API, Stale-While-Revalidate / Cache First for Shell & Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests
  if (request.method !== 'GET') return;

  // 2. API Routes: Network First with graceful offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ 
              success: false, 
              offline: true, 
              message: 'מצב אופליין — המערכת פועלת באופן מקומי' 
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 3. Navigation Requests (HTML shell): Network First, fallback to cached /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || caches.match('/');
          });
        })
    );
    return;
  }

  // 4. Static Assets (JS, CSS, images, fonts): Cache First with background refresh
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Fetch fresh copy in background to keep cache up to date
        fetch(request)
          .then((fresh) => {
            if (fresh.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, fresh));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch((err) => {
          console.warn('Fetch failed for asset:', request.url, err);
        });
    })
  );
});
