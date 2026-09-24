// sw.js
const CACHE_NAME = 'truyen-voice-v1.1.3';

// Danh sách tài nguyên cần cache
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js'
];

// Cài đặt an toàn: Tải từng file, file nào lỗi (404/CORS) sẽ tự bỏ qua
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachePromises = STATIC_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) {
            await cache.put(url, response);
          } else {
            console.warn(`[SW] Bỏ qua file lỗi (${response.status}): ${url}`);
          }
        } catch (err) {
          console.warn(`[SW] Không thể tải: ${url}`, err);
        }
      });
      await Promise.allSettled(cachePromises);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  // Bỏ qua các API TTS hoặc request phi GET
  if (e.request.method !== 'GET' || e.request.url.includes('/api/tts')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkRes;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});