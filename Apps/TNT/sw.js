// === NƠI DUY NHẤT BẠN CẦN ĐỔI PHIÊN BẢN KHI CÓ BẢN MỚI ===
const CACHE_NAME = '1.2.1';

const STATIC_ASSETS = [
    './',
    './index.html',
    './assets/main.js',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of STATIC_ASSETS) {
                try {
                    const isExternal = asset.startsWith('http');
                    const req = new Request(asset, isExternal ? { mode: 'no-cors' } : {});
                    const res = await fetch(req);
                    await cache.put(req, res);
                } catch (err) {
                    console.warn('[SW] Bỏ qua asset:', asset);
                }
            }
        })
    );
    self.skipWaiting();
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
    if (e.request.url.includes('/api/tts')) return;

    e.respondWith(
        caches.match(e.request).then((res) => {
            return (
                res ||
                fetch(e.request).then((fetchRes) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, fetchRes.clone());
                        return fetchRes;
                    });
                }).catch(() => caches.match('./index.html'))
            );
        })
    );
});

// LẮNG NGHE YÊU CẦU LẤY PHIÊN BẢN TỪ MAIN.JS
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});