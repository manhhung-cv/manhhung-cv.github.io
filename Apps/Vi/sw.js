const CACHE_NAME = 'finance-app-cache-v1';
// Chỉ lưu cache các file cục bộ của bạn
const urlsToCache = [
  './',
  './index.html',
  './script.js'
  // Đã xóa các link CDN ra khỏi đây
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});