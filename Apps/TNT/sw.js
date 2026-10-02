// === PHIÊN BẢN SERVICE WORKER ===
const CACHE_NAME = '2.0.0';

const STATIC_ASSETS = [
    './',
    './index.html',
    './assets/main.js',
    './manifest.json',
    './changelog.json',
    './assets/logo.png',
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
    // KHÔNG TỰ ĐỘNG skipWaiting() để tuân thủ chế độ cập nhật thủ công
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
        fetch(e.request)
            .then((fetchRes) => {
                const resClone = fetchRes.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return fetchRes;
            })
            .catch(() => {
                return caches.match(e.request).then((res) => res || caches.match('./index.html'));
            })
    );
});

// LẮNG NGHE LỆNH SKIP WAITING THỦ CÔNG HOẶC LẤY VERSION
self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    } else if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});