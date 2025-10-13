// sw.js
const CACHE_NAME = 'toolbox-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/asset/style.css',
    '/asset/main.js',
    '/asset/gmailtrick.js',
    '/asset/opengraph.js',
    '/asset/qrcode.js',
    '/asset/calculator.js',
    '/asset/size-converter.js',
    '/asset/health-calculator.js',
    '/asset/sleep-calculator.js',
    '/asset/excel-tool.js',
    '/asset/random.js',
    '/asset/notes.js',
    '/asset/settings.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Cài đặt Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Lắng nghe các yêu cầu fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Nếu tìm thấy trong cache, trả về nó
                if (response) {
                    return response;
                }
                // Nếu không, fetch từ mạng
                return fetch(event.request);
            })
    );
});