// ==========================================
// HÀM TIỆN ÍCH & CACHE (utils.js)
// Giao diện: Solid Premium (Hiệu năng cao)
// ==========================================

window.renderSkeletonGrid = (count = 12) => {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="flex flex-col p-3 rounded-2xl border border-zinc-200 dark:border-premium-border bg-white dark:bg-premium-card animate-pulse">
                <div class="w-full aspect-square rounded-xl bg-zinc-200 dark:bg-[#0a0a0a] mb-3"></div>
                <div class="h-3 bg-zinc-200 dark:bg-[#0a0a0a] rounded-full w-2/3 mx-auto mt-1"></div>
            </div>
        `;
    }
    return `<div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-5 w-full">${html}</div>`;
};

window.escapeJS = (str) => str ? str.replace(/'/g, "\\'") : '';
window.escapeHTML = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
};

window.debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// --- HỆ THỐNG CACHE KÉP (MEMORY + LOCALSTORAGE) ---
window._tftDataCache = {}; 

window.fetchCached = async (url, cacheMins = 1440) => { 
    if (window._tftDataCache[url]) return window._tftDataCache[url];

    window._tftDataCache[url] = (async () => {
        const fileName = url.split('/').pop() || 'data';
        const cacheKey = 'tft_cache_v1_' + fileName; 
        
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.time < cacheMins * 60 * 1000) {
                    return parsed.data;
                }
            }
        } catch (e) { localStorage.removeItem(cacheKey); }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Lỗi tải: ${url}`);
        const data = await res.json();

        try {
            localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data }));
        } catch (e) { 
            console.warn('Trình duyệt đầy bộ nhớ, bỏ qua lưu cache cục bộ.'); 
        }

        return data;
    })();

    return window._tftDataCache[url];
};

// ==========================================
// HÀM XÓA CACHE CHỦ ĐỘNG
// ==========================================
window.clearTFTCache = () => {
    window.uiConfirm('LÀM MỚI DỮ LIỆU', 'Hệ thống sẽ xóa bộ nhớ đệm và tải lại dữ liệu mới nhất từ Máy chủ. Bạn có muốn tiếp tục?', () => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tft_cache_v1_')) {
                localStorage.removeItem(key);
            }
        });
        
        window._tftDataCache = {};
        window.location.reload();
    });
};

// ==========================================
// TỪ ĐIỂN DỊCH TRANG BỊ (CHỐNG LỖI TỐI ĐA)
// ==========================================

const rawItemDict = {
    "Malware Matrix": "Ma Trận Mã Độc",
    "Drone Uplink": "Kết Nối Drone",
    "Space Groove Emblem": "Ấn Hành Tinh",
};

window._tftItemDict = {};
for (let key in rawItemDict) {
    let bulletProofKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    window._tftItemDict[bulletProofKey] = rawItemDict[key];
}

window.translateItemToVi = (engName) => {
    if (!engName) return '';
    const searchKey = engName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (window._tftItemDict[searchKey]) {
        return window._tftItemDict[searchKey];
    }
    return engName; 
};

// ==========================================
// TỪ ĐIỂN DỊCH TƯỚNG (CHỐNG LỖI TÊN KHÁC NHAU)
// ==========================================
const rawChampDict = {
    "Nunu & Willump": "Nunu",
    "Nunu and Willump": "Nunu",
    "Renata Glasc": "Renata",
    "Aurelion Sol": "AurelionSol",
    "Kha'Zix": "KhaZix",
    "Vel'Koz": "VelKoz",
    "Bel'Veth": "BelVeth",
    "Cho'Gath": "ChoGath",
    "Kai'Sa": "KaiSa",
    "Kog'Maw": "KogMaw",
    "Rek'Sai": "RekSai",
    "Dr. Mundo": "DrMundo",
    "Master Yi": "MasterYi",
    "Jarvan IV": "JarvanIV",
    "Lee Sin": "LeeSin",
    "Miss Fortune": "MissFortune",
    "Tahm Kench": "TahmKench",
    "Twisted Fate": "TwistedFate",
    "Xin Zhao": "XinZhao"
};

window._tftChampDict = {};
for (let key in rawChampDict) {
    let bulletProofKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    window._tftChampDict[bulletProofKey] = rawChampDict[key];
}

window.translateChampName = (rawName) => {
    if (!rawName) return '';
    const searchKey = rawName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (window._tftChampDict[searchKey]) {
        return window._tftChampDict[searchKey];
    }
    return rawName; 
};