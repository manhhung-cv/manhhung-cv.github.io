// === PHIÊN BẢN SERVICE WORKER ===
const CACHE_NAME = '2.0.5';

const STATIC_ASSETS = [
    './',
    './index.html',
    './assets/main.js',
    './manifest.json',
    './changelog.json',
    './assets/logo.png',
    './assets/vendor/tailwind.js',
    './assets/vendor/dexie.min.js',
    './assets/vendor/jszip.min.js',
    './assets/vendor/fontawesome/css/all.min.css',
    './assets/vendor/fontawesome/webfonts/fa-solid-900.woff2',
    './assets/vendor/fontawesome/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of STATIC_ASSETS) {
                try {
                    const res = await fetch(asset);
                    if (res.ok) {
                        await cache.put(asset, res);
                    }
                } catch (err) {
                    console.warn('[SW] Không thể nạp trước:', asset);
                }
            }
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // 1. Bỏ qua các request không phải GET (như API TTS POST)
    if (e.request.method !== 'GET') return;

    // 2. Bỏ qua request từ các domain analytics/tiện ích mở rộng trình duyệt
    const url = new URL(e.request.url);
    if (!url.protocol.startsWith('http')) return;
    if (url.hostname.includes('cloudflareinsights.com')) return;

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(e.request)
                .then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(async () => {
                    // Nếu là điều hướng trang HTML bị mất mạng thì trả về index.html
                    if (e.request.mode === 'navigate') {
                        const fallback = await caches.match('./index.html');
                        if (fallback) return fallback;
                    }
                    // Trả về một Response rỗng hợp lệ thay vì undefined để không văng TypeError
                    return new Response('', { status: 408, statusText: 'Network request failed' });
                });
        })
    );
});

self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    } else if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});