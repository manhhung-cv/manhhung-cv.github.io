const CACHE_NAME = 'finance-app-cache-v2'; // Tăng phiên bản cache để kích hoạt cập nhật
const urlsToCache = [
  './',
  './index.html',
  './script.js'
  // Không cần cache các link CDN
];

// Cài đặt Service Worker và cache các file cần thiết
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Buộc SW mới kích hoạt ngay lập tức
  );
});

// Kích hoạt Service Worker mới và xóa các cache cũ
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Nếu cache cũ không nằm trong danh sách trắng, xóa nó đi
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // SW mới sẽ kiểm soát trang ngay lập tức
  );
});


// Xử lý các yêu cầu fetch, ưu tiên lấy từ cache trước
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy trong cache, trả về response từ cache
        if (response) {
          return response;
        }

        // Nếu không, fetch từ network
        return fetch(event.request).then(
          function(response) {
            // Kiểm tra xem response có hợp lệ không
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Sao chép response vì response là một stream và chỉ có thể đọc 1 lần
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Thêm response mới vào cache để lần sau sử dụng
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});