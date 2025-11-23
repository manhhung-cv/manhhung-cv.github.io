const CACHE_NAME = 'limewallet-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Đảm bảo bạn đã tải các file này về thư mục assets/libs/
  './tailwind.js',
  './css/all.min.css',
  // Thêm các file icon nếu có
  '/Asset/logo/iconApps.png',
  '/Asset/logo/iconApps.png'
];

// 1. Cài đặt Service Worker và Cache tài nguyên
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Đang cache tài nguyên...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Kích hoạt ngay lập tức không cần chờ
  self.skipWaiting();
});

// 2. Kích hoạt và Xóa cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Xóa cache cũ:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Chiếm quyền điều khiển tất cả các client ngay lập tức
  return self.clients.claim();
});

// 3. Xử lý yêu cầu mạng (Cache First Strategy)
// Ưu tiên lấy từ Cache, nếu không có mới tải từ mạng
self.addEventListener('fetch', (event) => {
  // Bỏ qua các request không phải GET (ví dụ POST, PUT...)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Tìm thấy trong cache, trả về ngay
        return cachedResponse;
      }

      // Không có trong cache, tải từ mạng
      return fetch(event.request).then((networkResponse) => {
        // Kiểm tra phản hồi hợp lệ
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone phản hồi để lưu vào cache cho lần sau
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Xử lý khi mất mạng hoàn toàn và không có trong cache
        // Bạn có thể trả về một trang offline.html tùy chỉnh ở đây nếu muốn
        console.log('[Service Worker] Fetch failed; returning offline page instead.');
      });
    })
  );
});