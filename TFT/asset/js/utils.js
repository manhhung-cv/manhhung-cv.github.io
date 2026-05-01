// ==========================================
// HÀM TIỆN ÍCH & CACHE (utils.js)
// ==========================================

window.renderSkeletonGrid = (count = 12) => {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="flex flex-col p-2 rounded-sm border border-zinc-200 dark:border-premium-border bg-zinc-50 dark:bg-premium-card animate-pulse">
                <div class="w-full aspect-square rounded-sm bg-zinc-200 dark:bg-black mb-2"></div>
                <div class="h-3 bg-zinc-200 dark:bg-black rounded-sm w-2/3 mx-auto mt-1"></div>
            </div>
        `;
    }
    return `<div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 w-full">${html}</div>`;
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
    // Gọi modal Confirm có sẵn của hệ thống
    window.uiConfirm('LÀM MỚI DỮ LIỆU', 'Hệ thống sẽ xóa bộ nhớ đệm và tải lại dữ liệu mới nhất từ Máy chủ. Bạn có muốn tiếp tục?', () => {
        // 1. Quét toàn bộ LocalStorage và xóa các key bắt đầu bằng 'tft_cache_v1_'
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tft_cache_v1_')) {
                localStorage.removeItem(key);
            }
        });
        
        // 2. Xóa Memory Cache
        window._tftDataCache = {};
        
        // 3. Tải lại trang để áp dụng
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

// 2. Tự động bóp méo key về dạng thuần (Xóa sạch dấu cách, ký tự đặc biệt, ép chữ thường)
// VD: "Malware Matrix" -> "malwarematrix"
window._tftItemDict = {};
for (let key in rawItemDict) {
    let bulletProofKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    window._tftItemDict[bulletProofKey] = rawItemDict[key];
}

// 3. Hàm dịch thông minh
window.translateItemToVi = (engName) => {
    if (!engName) return '';
    
    // Tên đầu vào từ comps.json cũng sẽ bị ép về chuẩn (VD: " Malware  Matrix " -> "malwarematrix")
    const searchKey = engName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // So khớp! Nếu có thì trả về Tên Tiếng Việt đúng chuẩn
    if (window._tftItemDict[searchKey]) {
        return window._tftItemDict[searchKey];
    }
    
    // Không tìm thấy thì trả về tên gốc
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
    // Cứ gặp tướng nào lỗi tên, bạn vứt thêm vào đây nhé!
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