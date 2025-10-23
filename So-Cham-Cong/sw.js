// sw.js

const CACHE_NAME = 'so-cham-cong-cache-v1';
// Đây là các tệp cốt lõi để ứng dụng của bạn chạy
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './calc.js',
    './firebase-logic.js',
    './logo.png',
    'https://kit.fontawesome.com/9392097706.js' // Cache cả thư viện icon
];

// Cài đặt Service Worker và lưu tệp vào cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Mở cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Can thiệp vào các yêu cầu (requests)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Nếu tìm thấy trong cache, trả về từ cache
                if (response) {
                    return response;
                }
                // Nếu không, thử lấy từ mạng
                return fetch(event.request).catch(() => {
                    // Xử lý lỗi khi cả cache và mạng đều không có
                    // Bạn có thể trả về một trang offline dự phòng ở đây
                });
            })
    );
});

// Xóa cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});