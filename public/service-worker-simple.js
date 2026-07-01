// Simple cache-first service worker
const CACHE_NAME = 'evo-sdk-cache-v3';

// Core assets to cache for offline usage
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/app.js',
  '/dist/evo-sdk.module.js',
  '/playground.html',
  '/playground.css',
  '/src/playground.js',
  '/src/result-format.js',
  '/src/vendor/prism/prism-core.min.js',
  '/src/vendor/prism/prism-clike.min.js',
  '/src/vendor/prism/prism-javascript.min.js'
];

// Install event - pre-cache resources
self.addEventListener('install', event => {
  console.log('[SW] Installing and caching files...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => {
        console.log('[SW] All files cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && (cacheName.startsWith('evo-sdk-cache-') || cacheName.startsWith('wasm-sdk-cache-'))) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - cache first, with background update
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Only handle our cached files
  if (!urlsToCache.some(path => path === url.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Always return from cache if available
      if (cachedResponse) {
        console.log('[SW] Cache hit:', url.pathname);
        
        // Update cache in background
        event.waitUntil(
          fetch(event.request).then(response => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
                console.log('[SW] Cache updated in background:', url.pathname);
              });
            }
          }).catch(() => {
            console.log('[SW] Background update failed, keeping cached version');
          })
        );
        
        return cachedResponse;
      }
      
      // Cache miss - fetch and cache
      console.log('[SW] Cache miss, fetching:', url.pathname);
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
          console.log('[SW] Cached:', url.pathname);
        });
        
        return response;
      });
    })
  );
});

// Handle cache clear message
self.addEventListener('message', event => {
  if (event.data.action === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache cleared');
      if (event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});
