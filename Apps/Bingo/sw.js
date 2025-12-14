const CACHE_NAME = 'bingo-offline-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    // Nếu bạn có icon, hãy thêm đường dẫn vào đây
    // '/Asset/logo/logo.png', 
];

// 1. Cài đặt Service Worker và lưu các file tĩnh
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Kích hoạt và dọn dẹp cache cũ
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 3. Xử lý yêu cầu mạng (Strategy: Cache First, then Network)
// Đặc biệt: Tự động cache các tài nguyên bên ngoài (Tailwind CDN, Fonts) khi người dùng mở lần đầu
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Nếu có trong cache thì trả về ngay (Offline work here)
            if (cachedResponse) {
                return cachedResponse;
            }

            // Nếu không có, tải từ mạng
            return fetch(event.request).then((networkResponse) => {
                // Kiểm tra nếu phản hồi hợp lệ
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }

                // Copy phản hồi để lưu vào cache dùng cho lần sau
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Xử lý khi mất mạng hoàn toàn và không có cache
                console.log("Offline: Không thể tải tài nguyên này.");
            });
        })
    );
});