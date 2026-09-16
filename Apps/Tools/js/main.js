import { CATEGORIES as CONFIG_CATEGORIES, TOOLS } from './config.js';
import { UI } from './ui.js';

// ==========================================
// DOM CONTAINER CỐT LÕI
// ==========================================
const contentsContainer = document.getElementById('tab-contents-container');
const singleAppHost = document.getElementById('single-app-host');
const appSwitcher = document.getElementById('app-switcher');
const switcherCardsWrapper = document.getElementById('switcher-cards-wrapper');
const wallpaperLayer = document.getElementById('wallpaper-layer');

let currentLoadingToolId = null;

// ==========================================
// TRẠNG THÁI HỆ THỐNG
// ==========================================
const state = {
    tabs: [{ tabId: 'tab-1', toolId: 'home' }],
    activeTabId: 'tab-1'
};

// ==========================================
// NHẬN DIỆN THIẾT BỊ: MOBUI / TABUI / DEXUI
// ==========================================
let forcedDeviceMode = localStorage.getItem('hunqos_device_mode') || 'auto';

function detectDeviceMode() {
    if (forcedDeviceMode !== 'auto') {
        document.documentElement.setAttribute('data-device-mode', forcedDeviceMode);
        return forcedDeviceMode;
    }
    const w = window.innerWidth;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    let mode = 'phone';

    if (w >= 1024 && !isTouch) {
        mode = 'desktop'; // DexUI
    } else if (w >= 680 || (w >= 600 && isTouch)) {
        mode = 'tablet';  // TabUI
    } else {
        mode = 'phone';   // MobUI
    }

    document.documentElement.setAttribute('data-device-mode', mode);
    return mode;
}

window.setForcedDeviceMode = (mode) => {
    forcedDeviceMode = mode;
    localStorage.setItem('hunqos_device_mode', mode);

    const modeLabels = {
        'auto': 'Tự động',
        'phone': 'MobUI',
        'tablet': 'TabUI',
        'desktop': 'DexUI'
    };

    ['auto', 'phone', 'tablet', 'desktop'].forEach(m => {
        const btn = document.getElementById(`mode-btn-${m}`);
        if (btn) {
            btn.className = (m === mode)
                ? "py-2.5 px-2 rounded-xl bg-accent-theme text-white font-medium text-xs text-center border border-white/20 transition-all"
                : "py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs text-center transition-all";
        }
    });

    detectDeviceMode();
    initHomescreenPages();
    renderDesktopTabs();
    UI.showAlert('Chế độ hiển thị', `Đã chuyển sang ${modeLabels[mode]}.`, 'success');
};

function getGridColumns() {
    const mode = detectDeviceMode();
    if (mode === 'desktop') return 8;
    if (mode === 'tablet') return 6;
    return 4;
}

// ==========================================
// CHẾ ĐỘ PURE MINIMAL (MINIMAL FLAT UTILITY HUB)
// ==========================================
let isPureMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';
let minimalSelectedCategory = 'all';

function applyPureMinimalMode(enable) {
    isPureMinimal = enable;
    document.body.classList.toggle('pure-minimal-mode', enable);
    const toggleBtn = document.getElementById('toggle-minimal-setting');
    toggleBtn?.classList.toggle('active', enable);
    if (enable) {
        renderPureMinimalCategories();
        renderPureMinimalAppList();
        updatePureMinimalClock();
    }
}

document.getElementById('toggle-minimal-setting')?.addEventListener('click', () => {
    isPureMinimal = !isPureMinimal;
    localStorage.setItem('hunqos_pure_minimal', isPureMinimal);
    applyPureMinimalMode(isPureMinimal);
    UI.showAlert('Pure Minimal', isPureMinimal ? 'Đã bật chế độ Minimal Flat Utility.' : 'Đã trở lại giao diện chuẩn.', 'info');
});

function updatePureMinimalClock() {
    const clock = document.getElementById('minimal-clock');
    const date = document.getElementById('minimal-date');
    const now = new Date();
    if (clock) clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (date) {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        date.textContent = `${days[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}`;
    }
}

function renderPureMinimalCategories() {
    const tabContainer = document.getElementById('minimal-category-tabs');
    if (!tabContainer) return;

    const allCats = [{ id: 'all', name: 'Tất cả', icon: 'fas fa-border-all' }, ...CONFIG_CATEGORIES];

    tabContainer.innerHTML = allCats.map(cat => {
        const isActive = minimalSelectedCategory === cat.id;
        return `
            <button onclick="window.filterMinimalCategory('${cat.id}')" 
                    class="flat-category-chip ${isActive ? 'active' : ''}">
                <i class="${cat.icon || 'fas fa-folder'} mr-1.5 text-[11px]"></i>
                <span>${cat.name}</span>
            </button>
        `;
    }).join('');
}

window.filterMinimalCategory = (catId) => {
    minimalSelectedCategory = catId;
    renderPureMinimalCategories();
    const searchInput = document.getElementById('minimal-search-input');
    renderPureMinimalAppList(searchInput ? searchInput.value : '');
};

function renderPureMinimalAppList(filterText = '') {
    const listEl = document.getElementById('minimal-app-list');
    const countBadge = document.getElementById('minimal-count-badge');
    const titleEl = document.getElementById('minimal-section-title');
    if (!listEl) return;

    const query = filterText.trim().toLowerCase();
    let filtered = TOOLS.filter(t => {
        const matchesQuery = !query || t.name.toLowerCase().includes(query) || (t.desc && t.desc.toLowerCase().includes(query));
        const matchesCategory = minimalSelectedCategory === 'all' || t.catId === minimalSelectedCategory;
        return matchesQuery && matchesCategory;
    });

    if (countBadge) countBadge.textContent = filtered.length;
    if (titleEl) {
        if (minimalSelectedCategory === 'all') {
            titleEl.textContent = query ? `Kết quả tìm kiếm ("${query}")` : 'Tất cả tiện ích';
        } else {
            const currentCat = CONFIG_CATEGORIES.find(c => c.id === minimalSelectedCategory);
            titleEl.textContent = currentCat ? currentCat.name : 'Danh mục tiện ích';
        }
    }

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full py-16 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                <i class="fas fa-inbox text-2xl opacity-40"></i>
                <span>Không tìm thấy tiện ích phù hợp</span>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(tool => {
        const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
        const catInfo = CONFIG_CATEGORIES.find(c => c.id === tool.catId);
        const catName = catInfo ? catInfo.name : 'Tiện ích';

        return `
            <div class="flat-tool-card" onclick="window.openToolGlobal('${tool.id}')">
                <div class="flat-tool-icon" style="${bgStyle}">
                    <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1.5 mb-1">
                        <div class="text-xs font-semibold text-zinc-100 truncate">${tool.name}</div>
                        <span class="flat-tool-badge">${catName}</span>
                    </div>
                    <div class="text-[11px] text-zinc-400 truncate leading-relaxed">${tool.desc || 'Mở công cụ'}</div>
                </div>
                <i class="fas fa-arrow-up-right-from-square text-[10px] text-zinc-600 shrink-0 ml-1"></i>
            </div>
        `;
    }).join('');
}

document.getElementById('minimal-search-input')?.addEventListener('input', (e) => {
    renderPureMinimalAppList(e.target.value);
});

async function updateStorageInfo() {
    const storageEl = document.getElementById('system-storage-info');
    if (!storageEl) return;
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const { quota, usage } = await navigator.storage.estimate();
            const usedMB = (usage / (1024 * 1024)).toFixed(1);
            const totalGB = (quota / (1024 * 1024 * 1024)).toFixed(0);
            storageEl.textContent = `${usedMB} MB / ~${totalGB} GB`;
            return;
        } catch (e) {}
    }
    storageEl.textContent = 'Trực tuyến / PWA';
}

// ==========================================
// QUẢN LÝ CHẶN CHUỘT PHẢI
// ==========================================
let isContextMenuBlocked = localStorage.getItem('hunqos_block_contextmenu') !== 'false';

function handleGlobalContextMenu(e) {
    if (!isContextMenuBlocked) return true;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        return true;
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
}
document.addEventListener('contextmenu', handleGlobalContextMenu, { capture: true });

const contextmenuToggleBtn = document.getElementById('toggle-contextmenu-setting');
if (contextmenuToggleBtn) {
    contextmenuToggleBtn.classList.toggle('active', isContextMenuBlocked);
    contextmenuToggleBtn.addEventListener('click', () => {
        isContextMenuBlocked = !isContextMenuBlocked;
        localStorage.setItem('hunqos_block_contextmenu', isContextMenuBlocked);
        contextmenuToggleBtn.classList.toggle('active', isContextMenuBlocked);
        UI.showAlert('Bảo vệ', isContextMenuBlocked ? 'Đã bật chặn chuột phải.' : 'Đã mở khóa chuột phải.', 'info');
    });
}

// ==========================================
// LỊCH SỬ GẦN ĐÂY
// ==========================================
const MAX_RECENTS = 8;
function getRecentToolIds() {
    try {
        return JSON.parse(localStorage.getItem('hunqos_recent_tools') || '[]');
    } catch (e) {
        return [];
    }
}

function pushRecentTool(toolId) {
    if (!toolId || toolId === 'home') return;
    let recents = getRecentToolIds();
    recents = [toolId, ...recents.filter(id => id !== toolId)].slice(0, MAX_RECENTS);
    localStorage.setItem('hunqos_recent_tools', JSON.stringify(recents));
}

// ==========================================
// QUẢN LÝ HÌNH NỀN (MẶC ĐỊNH: ./bg/bg.png)
// ==========================================
const DEFAULT_WALLPAPER = './bg/bg.png';
const DB_NAME = 'HunqOS_DB';
const DB_STORE = 'settings';
let dbInstance = null;
let currentCustomWallpaper = null;
let isDarkMode = localStorage.getItem('hunqos_darkmode') !== 'false';

function openOSDatabase() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
        };
        req.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        req.onerror = () => reject(req.error);
    });
}

async function saveWallpaperToDB(val) {
    try {
        const db = await openOSDatabase();
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(val, 'system_wallpaper');
    } catch (e) {
        localStorage.setItem('hunqos_custom_wp', val || '');
    }
}

async function getWallpaperFromDB() {
    try {
        const db = await openOSDatabase();
        return new Promise((resolve) => {
            const tx = db.transaction(DB_STORE, 'readonly');
            const req = tx.objectStore(DB_STORE).get('system_wallpaper');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        return localStorage.getItem('hunqos_custom_wp') || null;
    }
}

async function syncWallpaperDisplay() {
    if (!wallpaperLayer) return;
    if (isPureMinimal) {
        wallpaperLayer.style.backgroundImage = 'none';
        return;
    }
    if (currentCustomWallpaper === null) {
        currentCustomWallpaper = await getWallpaperFromDB();
    }
    if (currentCustomWallpaper) {
        wallpaperLayer.style.backgroundImage = `url('${currentCustomWallpaper}')`;
    } else {
        wallpaperLayer.style.backgroundImage = `url('${DEFAULT_WALLPAPER}')`;
    }
}

function applyWallpaper(wp) {
    currentCustomWallpaper = wp;
    if (!wallpaperLayer) return;
    if (wp) {
        wallpaperLayer.style.backgroundImage = `url('${wp}')`;
    } else {
        wallpaperLayer.style.backgroundImage = `url('${DEFAULT_WALLPAPER}')`;
    }
}

window.resetWallpaper = async () => {
    currentCustomWallpaper = null;
    await saveWallpaperToDB(null);
    localStorage.removeItem('hunqos_custom_wp');
    applyWallpaper(null);
    UI.showAlert('Hình nền', 'Đã khôi phục nền mặc định (./bg/bg.png).', 'info');
};

const wallpaperFileInput = document.getElementById('wallpaper-file-input');
if (wallpaperFileInput) {
    wallpaperFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            applyWallpaper(base64);
            await saveWallpaperToDB(base64);
            UI.showAlert('Hình nền', 'Đã cập nhật hình nền từ thiết bị.', 'success');
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================
// CẤU HÌNH THEME & XỬ LÝ MÀU SẮC ICON
// ==========================================
function resolveColorCss(colorValue, isBackground = true) {
    if (!colorValue || typeof colorValue !== 'string') return '';
    const trimmed = colorValue.trim();
    const isGrad = trimmed.includes('gradient(');
    if (isBackground) return isGrad ? `background-image: ${trimmed};` : `background-color: ${trimmed};`;
    return isGrad ? `background-image: ${trimmed};` : `color: ${trimmed};`;
}

function computeIconStyles(tool) {
    const rawColor = tool.bgColor || tool.color || 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
    const bgStyle = resolveColorCss(rawColor, true);
    const iconStyle = `color: ${tool.iconColor || '#ffffff'};`;
    return { bgStyle, iconStyle, iconClass: '' };
}

// ==========================================
// QUẢN LÝ BỐ CỤC THEO DANH MỤC CATID & CHẾ ĐỘ GOM GỌN
// ==========================================
let isCompactGridMode = localStorage.getItem('hunqos_compact_grid') === 'true';

function createLayoutFromCategories() {
    const layout = {};
    let pageIdx = 0;

    CONFIG_CATEGORIES.forEach(cat => {
        const catTools = TOOLS.filter(t => t.catId === cat.id).map(t => t.id);
        if (catTools.length > 0) {
            for (let i = 0; i < catTools.length; i += 16) {
                const subPart = catTools.length > 16 ? ` (${Math.floor(i / 16) + 1})` : '';
                layout[pageIdx] = {
                    catId: cat.id,
                    title: `${cat.name}${subPart}`,
                    icon: cat.icon || 'fas fa-cube',
                    tools: catTools.slice(i, i + 16)
                };
                pageIdx++;
            }
        }
    });

    const assignedIds = new Set(Object.values(layout).flatMap(p => p.tools));
    const remainingTools = TOOLS.filter(t => !assignedIds.has(t.id)).map(t => t.id);
    if (remainingTools.length > 0) {
        layout[pageIdx] = { catId: 'other', title: 'Khác', icon: 'fas fa-th-large', tools: remainingTools };
    }
    return layout;
}

function getStoredPageLayout() {
    const raw = localStorage.getItem('hunqos_page_layout_v22');
    if (raw) {
        try { return JSON.parse(raw); } catch (e) {}
    }
    return createLayoutFromCategories();
}

let pageLayout = getStoredPageLayout();
let selectedOrganizerPage = 0;
let selectedToolsForBatch = new Set();

function savePageLayout() {
    localStorage.setItem('hunqos_page_layout_v22', JSON.stringify(pageLayout));
}

function getPageCount() {
    if (isCompactGridMode) return 1;
    const keys = Object.keys(pageLayout).map(Number);
    return Math.max(1, keys.length > 0 ? Math.max(...keys) + 1 : 1);
}

// Toggle chế độ gom gọn
const compactToggleBtn = document.getElementById('toggle-compact-setting');
if (compactToggleBtn) {
    compactToggleBtn.classList.toggle('active', isCompactGridMode);
    compactToggleBtn.addEventListener('click', () => {
        isCompactGridMode = !isCompactGridMode;
        localStorage.setItem('hunqos_compact_grid', isCompactGridMode);
        compactToggleBtn.classList.toggle('active', isCompactGridMode);
        currentPageIndex = 0;
        initHomescreenPages();
        UI.showAlert('Bố cục Launcher', isCompactGridMode ? 'Đã bật chế độ gom gọn toàn bộ app.' : 'Đã phân trang riêng theo từng danh mục.', 'info');
    });
}

window.autoOrganizeByCategories = () => {
    pageLayout = createLayoutFromCategories();
    selectedOrganizerPage = 0;
    selectedToolsForBatch.clear();
    savePageLayout();
    initHomescreenPages();
    UI.showAlert('Bố cục', 'Đã tự động gom nhóm ứng dụng theo danh mục.', 'success');
};

let currentAccentColor = localStorage.getItem('hunqos_accent_color') || '#10b981';
function applySystemAccent(color) {
    currentAccentColor = color;
    document.documentElement.style.setProperty('--hunq-accent', color);
    const picker = document.getElementById('system-accent-picker');
    if (picker) picker.value = color;
}

window.setSystemAccent = (color) => {
    localStorage.setItem('hunqos_accent_color', color);
    applySystemAccent(color);
};

// ==========================================
// STATUS BAR & DARK MODE
// ==========================================
function updateStatusbarBackground() {
    const topBar = document.getElementById('top-system-bar');
    const isHome = !contentsContainer || contentsContainer.classList.contains('hidden') || contentsContainer.style.display === 'none';

    if (topBar) {
        topBar.classList.remove('statusbar-home', 'statusbar-app-dark', 'statusbar-app-light');
        topBar.classList.add(isHome ? 'statusbar-home' : (isDarkMode ? 'statusbar-app-dark' : 'statusbar-app-light'));
    }
}

function applyDarkMode(enable) {
    isDarkMode = enable;
    document.documentElement.classList.toggle('dark', enable);
    document.getElementById('toggle-darkmode-setting')?.classList.toggle('active', enable);
    syncWallpaperDisplay();
    updateStatusbarBackground();
}

document.getElementById('toggle-darkmode-setting')?.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('hunqos_darkmode', isDarkMode);
    applyDarkMode(isDarkMode);
});

// ==========================================
// DOCK
// ==========================================
const DEFAULT_DOCK = [
    { type: 'tool', id: 'home' },
    { type: 'action', action: 'spotlight', icon: 'fas fa-search', name: 'Tìm kiếm' },
    { type: 'action', action: 'multitask', icon: 'fas fa-layer-group', name: 'Cửa sổ' },
    { type: 'action', action: 'settings', icon: 'fas fa-cog', name: 'Cài đặt' }
];

let dockList = JSON.parse(localStorage.getItem('hunqos_dock_items')) || DEFAULT_DOCK;

function getToolData(toolId) {
    if (toolId === 'home') return { id: 'home', name: 'Bàn làm việc', icon: 'fas fa-home', desc: 'Màn hình chính' };
    return TOOLS.find(t => t.id === toolId) || { id: toolId, name: toolId, icon: 'fas fa-cube', desc: 'Ứng dụng' };
}

function renderDock() {
    const container = document.getElementById('dock-items-container');
    if (!container) return;

    container.innerHTML = dockList.map(item => {
        if (item.type === 'action') {
            let onclickAttr = item.action === 'spotlight' ? 'window.openSpotlight()' : (item.action === 'multitask' ? 'window.openMultitasking()' : 'window.openSettings()');
            let bgClass = item.action === 'multitask' ? 'bg-accent-theme text-white' : 'bg-zinc-800 text-white';
            return `
                <button onclick="${onclickAttr}" class="dock-item ${bgClass} flex items-center justify-center text-lg active:scale-95 transition-transform" title="${item.name}">
                    <i class="${item.icon}"></i>
                </button>
            `;
        }

        const tool = getToolData(item.id);
        if (item.id === 'home') {
            return `
                <button onclick="window.goHome()" class="dock-item bg-white text-zinc-900 flex items-center justify-center text-lg active:scale-95 transition-transform" title="${tool.name}">
                    <i class="${tool.icon}"></i>
                </button>
            `;
        }

        const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
        return `
            <button onclick="window.openToolGlobal('${item.id}')" class="dock-item flex items-center justify-center text-lg active:scale-95 transition-transform border border-white/20 shadow-md" style="${bgStyle}" title="${tool.name}">
                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
            </button>
        `;
    }).join('');
}

// ==========================================
// HOMESCREEN LAUNCHER
// ==========================================
let currentPageIndex = 0;
let totalPages = 1;

function initHomescreenPages() {
    const pagesSlider = document.getElementById('launcher-pages-slider');
    if (!pagesSlider) return;

    const cols = getGridColumns();
    pagesSlider.innerHTML = '';

    // NẾU BẬT CHẾ ĐỘ GOM GỌN: Gộp toàn bộ vào 1 luồng duy nhất (Trang 0 gợi ý + tất cả các mục cuộn dọc)
    if (isCompactGridMode) {
        totalPages = 1;
        const pageEl = document.createElement('div');
        pageEl.className = 'launcher-page no-scrollbar space-y-6';

        const recentIds = getRecentToolIds();
        const recentTools = recentIds.map(id => getToolData(id)).filter(Boolean);

        let html = '';
        if (recentTools.length > 0) {
            html += `
                <div class="w-full max-w-4xl">
                    <div class="suggestion-section-title">
                        <span><i class="fas fa-history mr-1 text-accent-theme"></i> Đã dùng gần đây</span>
                    </div>
                    <div class="grid-layer-container mb-4" style="grid-template-columns: repeat(${cols}, 1fr)">
                        ${recentTools.map(tool => {
                            const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                            return `
                                <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                                    <div class="app-icon-box" style="${bgStyle}">
                                        <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                                    </div>
                                    <span class="app-icon-label">${tool.name}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        CONFIG_CATEGORIES.forEach(cat => {
            const catTools = TOOLS.filter(t => t.catId === cat.id);
            if (catTools.length === 0) return;
            html += `
                <div class="w-full max-w-4xl">
                    <div class="page-category-header">
                        <div class="page-category-badge">
                            <i class="${cat.icon || 'fas fa-cube'}"></i>
                            <span>${cat.name}</span>
                        </div>
                        <span class="page-category-count">${catTools.length} ứng dụng</span>
                    </div>
                    <div class="grid-layer-container" style="grid-template-columns: repeat(${cols}, 1fr)">
                        ${catTools.map(tool => {
                            const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                            return `
                                <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                                    <div class="app-icon-box" style="${bgStyle}">
                                        <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                                    </div>
                                    <span class="app-icon-label">${tool.name}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        pageEl.innerHTML = html;
        pagesSlider.appendChild(pageEl);
        renderPageDots();
        renderPageOrganizer();
        return;
    }

    // NẾU Ở CHẾ ĐỘ PHÂN TRANG DANH MỤC:
    const rawPageCount = getPageCount();
    totalPages = 1 + rawPageCount;

    // TRANG 0: GỢI Ý & GẦN ĐÂY
    const pageZeroEl = document.createElement('div');
    pageZeroEl.className = 'launcher-page no-scrollbar';

    const recentIds = getRecentToolIds();
    const recentTools = recentIds.map(id => getToolData(id)).filter(Boolean);
    const suggestedTools = TOOLS.slice(0, cols * 2);

    let p0Html = `
        <div class="page-category-header">
            <div class="page-category-badge">
                <i class="fas fa-house text-amber-400"></i>
                <span>Gợi ý & Gần đây</span>
            </div>
            <span class="page-category-count">${recentTools.length + suggestedTools.length} ứng dụng</span>
        </div>
    `;

    if (recentTools.length > 0) {
        p0Html += `
            <div class="suggestion-section-title">
                <span><i class="fas fa-history mr-1 text-accent-theme"></i> Đã dùng gần đây</span>
            </div>
            <div class="grid-layer-container mb-4" style="grid-template-columns: repeat(${cols}, 1fr)">
                ${recentTools.map(tool => {
                    const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                    return `
                        <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                            <div class="app-icon-box" style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                            </div>
                            <span class="app-icon-label">${tool.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    p0Html += `
        <div class="suggestion-section-title">
            <span><i class="fas fa-compass mr-1 text-blue-400"></i> Tiện ích đề xuất</span>
        </div>
        <div class="grid-layer-container" style="grid-template-columns: repeat(${cols}, 1fr)">
            ${suggestedTools.map(tool => {
                const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                return `
                    <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                        <div class="app-icon-box" style="${bgStyle}">
                            <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                        </div>
                        <span class="app-icon-label">${tool.name}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    pageZeroEl.innerHTML = p0Html;
    pagesSlider.appendChild(pageZeroEl);

    // TRANG 1 TRỞ ĐI: CÁC DANH MỤC
    for (let p = 0; p < rawPageCount; p++) {
        const pageData = pageLayout[p] || { title: `Trang ${p + 1}`, icon: 'fas fa-cube', tools: [] };
        const pageEl = document.createElement('div');
        pageEl.className = 'launcher-page no-scrollbar';

        const toolIds = pageData.tools || [];
        pageEl.innerHTML = `
            <div class="page-category-header">
                <div class="page-category-badge">
                    <i class="${pageData.icon || 'fas fa-cube'}"></i>
                    <span>${pageData.title || `Trang ${p + 1}`}</span>
                </div>
                <span class="page-category-count">${toolIds.length} ứng dụng</span>
            </div>
            <div class="grid-layer-container" style="grid-template-columns: repeat(${cols}, 1fr)">
                ${toolIds.map(toolId => {
                    const tool = getToolData(toolId);
                    const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
                    return `
                        <div class="home-item" onclick="window.openToolGlobal('${tool.id}')">
                            <div class="app-icon-box" style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                            </div>
                            <span class="app-icon-label">${tool.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        pagesSlider.appendChild(pageEl);
    }

    renderPageDots();
    renderPageOrganizer();
}

// ==========================================
// XỬ LÝ COLLAPSIBLE PAGE DOTS THÔNG MINH
// ==========================================
const pageDotsWrapper = document.getElementById('page-dots-wrapper');
let dotsCollapseTimeout = null;

function expandPageDots() {
    if (!pageDotsWrapper) return;
    pageDotsWrapper.classList.add('expanded');
    clearTimeout(dotsCollapseTimeout);
    dotsCollapseTimeout = setTimeout(() => {
        pageDotsWrapper.classList.remove('expanded');
    }, 3500);
}

if (pageDotsWrapper) {
    // Chạm vào để bung icon trên điện thoại / tablet
    pageDotsWrapper.addEventListener('touchstart', () => {
        expandPageDots();
    }, { passive: true });

    // Thu nhỏ lại khi click hoặc chạm ra ngoài
    document.addEventListener('touchstart', (e) => {
        if (!pageDotsWrapper.contains(e.target)) {
            pageDotsWrapper.classList.remove('expanded');
        }
    }, { passive: true });
}

function renderPageDots() {
    const pageDotsContainer = document.getElementById('page-dots');
    if (!pageDotsContainer) return;
    pageDotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        const isActive = i === currentPageIndex;
        dot.className = `page-dot-btn ${isActive ? 'active' : 'inactive'}`;

        let iconClass = 'fas fa-house';
        let labelTitle = 'Gợi ý & Gần đây';

        if (isCompactGridMode) {
            iconClass = 'fas fa-border-all';
            labelTitle = 'Toàn bộ ứng dụng';
        } else if (i > 0) {
            const pageData = pageLayout[i - 1];
            iconClass = pageData?.icon || 'fas fa-cube';
            labelTitle = pageData?.title || `Trang ${i}`;
        }

        dot.title = labelTitle;
        dot.innerHTML = `<i class="${iconClass}"></i>`;
        
        dot.onclick = (e) => {
            // Nếu đang thu gọn trên màn hình cảm ứng, chạm lần đầu sẽ mở rộng, chạm lần 2/khi đã mở sẽ chuyển trang
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (isTouch && pageDotsWrapper && !pageDotsWrapper.classList.contains('expanded')) {
                e.stopPropagation();
                expandPageDots();
                return;
            }
            goToPage(i);
        };
        pageDotsContainer.appendChild(dot);
    }
}

function goToPage(index) {
    const viewport = document.getElementById('launcher-viewport');
    if (!viewport) return;
    currentPageIndex = Math.max(0, Math.min(index, totalPages - 1));
    viewport.scrollTo({
        left: currentPageIndex * viewport.clientWidth,
        behavior: 'smooth'
    });
    renderPageDots();
}

const launcherViewport = document.getElementById('launcher-viewport');
if (launcherViewport) {
    let scrollTimeout = null;
    launcherViewport.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const index = Math.round(launcherViewport.scrollLeft / launcherViewport.clientWidth);
            if (index !== currentPageIndex) {
                currentPageIndex = index;
                renderPageDots();
            }
        }, 50);
    }, { passive: true });
}

// ==========================================
// CƠ CHẾ SẮP XẾP BATCH CHỌN NHIỀU ỨNG DỤNG
// ==========================================
function renderPageOrganizer() {
    const tabsContainer = document.getElementById('page-organizer-tabs');
    const listContainer = document.getElementById('page-organizer-list');
    const targetPageSelect = document.getElementById('batch-target-page-select');
    const countBadge = document.getElementById('selected-count-badge');
    const selectAllBtnText = document.getElementById('btn-select-all-text');

    if (!tabsContainer || !listContainer) return;

    const numPages = getPageCount();
    if (selectedOrganizerPage >= numPages) selectedOrganizerPage = 0;

    tabsContainer.innerHTML = Array.from({ length: numPages }, (_, i) => {
        const isSelected = i === selectedOrganizerPage;
        const pageData = pageLayout[i] || { title: `Trang ${i + 1}`, tools: [] };
        return `
            <button onclick="window.selectOrganizerPage(${i})" 
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected ? 'bg-accent-theme text-white' : 'bg-white/5 hover:bg-white/10 text-white/60'
                }">
                <i class="${pageData.icon || 'fas fa-folder'} text-[10px]"></i>
                <span>${pageData.title || `Trang ${i + 1}`}</span>
                <span class="text-[10px] opacity-70 px-1 rounded-full bg-black/30">${(pageData.tools || []).length}</span>
            </button>
        `;
    }).join('');

    if (targetPageSelect) {
        targetPageSelect.innerHTML = Array.from({ length: numPages }, (_, i) => {
            if (i === selectedOrganizerPage) return '';
            const pTitle = pageLayout[i]?.title || `Trang ${i + 1}`;
            return `<option value="${i}">Tới: ${pTitle}</option>`;
        }).join('');
    }

    const currentPageData = pageLayout[selectedOrganizerPage] || { title: `Trang ${selectedOrganizerPage + 1}`, tools: [] };
    const currentToolIds = currentPageData.tools || [];

    let headerHtml = `
        <div class="flex items-center gap-2 mb-2.5 p-2 bg-black/40 rounded-lg border border-white/5">
            <span class="text-xs text-white/50 shrink-0">Đổi tên trang:</span>
            <input type="text" value="${currentPageData.title || ''}" 
                   onchange="window.renamePageCategory(${selectedOrganizerPage}, this.value)"
                   placeholder="Nhập tên trang..." 
                   class="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-theme">
        </div>
    `;

    if (countBadge) countBadge.textContent = `Đã chọn ${selectedToolsForBatch.size} app`;

    if (selectAllBtnText) {
        const allSelected = currentToolIds.length > 0 && currentToolIds.every(id => selectedToolsForBatch.has(id));
        selectAllBtnText.textContent = allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
    }

    if (currentToolIds.length === 0) {
        listContainer.innerHTML = headerHtml + `
            <div class="py-8 text-center text-white/40 text-xs flex flex-col items-center justify-center gap-2">
                <i class="far fa-folder-open text-xl opacity-50"></i>
                <span>Trang này chưa có ứng dụng nào</span>
                ${numPages > 1 ? `
                    <button onclick="window.removeEmptyPage(${selectedOrganizerPage})" 
                        class="mt-1 px-3 py-1 rounded bg-red-500/20 text-red-400 text-[11px] hover:bg-red-500/30">
                        Xóa trang rỗng này
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    listContainer.innerHTML = headerHtml + `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${currentToolIds.map((id) => {
                const tool = getToolData(id);
                const isSelected = selectedToolsForBatch.has(id);
                const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);

                return `
                    <div onclick="window.toggleToolSelection('${id}')" 
                         class="organizer-item-card flex items-center justify-between p-2 rounded-xl bg-black/40 border ${isSelected ? 'selected' : 'border-white/5'} text-xs cursor-pointer select-none">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-accent-theme border-accent-theme text-white' : 'border-white/20 text-transparent'} text-[10px]">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10" style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass} text-xs" style="${iconStyle}"></i>
                            </div>
                            <span class="truncate font-medium text-white/90">${tool.name}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

window.toggleToolSelection = (toolId) => {
    if (selectedToolsForBatch.has(toolId)) selectedToolsForBatch.delete(toolId);
    else selectedToolsForBatch.add(toolId);
    renderPageOrganizer();
};

window.toggleSelectAllTools = () => {
    const currentToolIds = pageLayout[selectedOrganizerPage]?.tools || [];
    const allSelected = currentToolIds.length > 0 && currentToolIds.every(id => selectedToolsForBatch.has(id));
    if (allSelected) currentToolIds.forEach(id => selectedToolsForBatch.delete(id));
    else currentToolIds.forEach(id => selectedToolsForBatch.add(id));
    renderPageOrganizer();
};

window.applyBatchMove = () => {
    const targetSelect = document.getElementById('batch-target-page-select');
    if (!targetSelect || selectedToolsForBatch.size === 0) {
        UI.showAlert('Lưu ý', 'Hãy chọn ít nhất 1 ứng dụng.', 'warning');
        return;
    }
    const toPage = parseInt(targetSelect.value, 10);
    if (isNaN(toPage) || toPage === selectedOrganizerPage) return;

    if (!pageLayout[selectedOrganizerPage]) pageLayout[selectedOrganizerPage] = { title: `Trang ${selectedOrganizerPage + 1}`, tools: [] };
    if (!pageLayout[toPage]) pageLayout[toPage] = { title: `Trang ${toPage + 1}`, tools: [] };

    const movingIds = Array.from(selectedToolsForBatch);
    pageLayout[selectedOrganizerPage].tools = pageLayout[selectedOrganizerPage].tools.filter(id => !selectedToolsForBatch.has(id));
    pageLayout[toPage].tools.push(...movingIds);

    const movedCount = movingIds.length;
    selectedToolsForBatch.clear();
    savePageLayout();
    initHomescreenPages();
    UI.showAlert('Thành công', `Đã chuyển ${movedCount} app sang ${pageLayout[toPage].title}.`, 'success');
};

window.renamePageCategory = (pageIndex, newTitle) => {
    if (!pageLayout[pageIndex]) return;
    pageLayout[pageIndex].title = newTitle.trim() || `Trang ${pageIndex + 1}`;
    savePageLayout();
    initHomescreenPages();
};

window.selectOrganizerPage = (p) => {
    selectedOrganizerPage = p;
    selectedToolsForBatch.clear();
    renderPageOrganizer();
};

window.addNewPageSetting = () => {
    const nextPageIndex = getPageCount();
    pageLayout[nextPageIndex] = { title: `Trang ${nextPageIndex + 1}`, icon: 'fas fa-folder-plus', tools: [] };
    selectedOrganizerPage = nextPageIndex;
    selectedToolsForBatch.clear();
    savePageLayout();
    initHomescreenPages();
    UI.showAlert('Trang mới', 'Đã thêm trang mới.', 'info');
};

window.removeEmptyPage = (pageIndex) => {
    const numPages = getPageCount();
    if (numPages <= 1) return;
    const newLayout = {};
    let newIndex = 0;
    for (let p = 0; p < numPages; p++) {
        if (p !== pageIndex) {
            newLayout[newIndex] = pageLayout[p];
            newIndex++;
        }
    }
    pageLayout = newLayout;
    selectedOrganizerPage = Math.max(0, pageIndex - 1);
    selectedToolsForBatch.clear();
    savePageLayout();
    initHomescreenPages();
};

// ==========================================
// ĐIỀU HƯỚNG & NÚT HOME THÔNG MINH
// ==========================================
function isHomeScreenVisible() {
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    return homescreenLauncher && !homescreenLauncher.classList.contains('hidden') && homescreenLauncher.style.display !== 'none';
}

window.goHome = () => {
    window.closeMultitasking();

    if (isHomeScreenVisible()) {
        const targetHomeIndex = (!isCompactGridMode && totalPages > 1) ? 1 : 0;
        goToPage(targetHomeIndex);
        return;
    }

    state.activeTabId = 'tab-1';
    showHomescreen();
};

function showHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.add('hidden');
        contentsContainer.style.display = 'none';
    }
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher && !isPureMinimal) {
        homescreenLauncher.classList.remove('hidden');
        homescreenLauncher.style.display = 'flex';
    }
    updateStatusbarBackground();
}

function hideHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.remove('hidden');
        contentsContainer.style.display = 'flex';
    }
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher) {
        homescreenLauncher.classList.add('hidden');
        homescreenLauncher.style.display = 'none';
    }
    updateStatusbarBackground();
}

// ==========================================
// QUẢN LÝ APP TOÀN MÀN HÌNH
// ==========================================
async function openTool(toolId) {
    if (toolId === 'home') {
        window.goHome();
        return;
    }

    pushRecentTool(toolId);
    hideHomescreen();

    let pane = document.getElementById(`pane-${toolId}`);
    if (!pane) {
        pane = document.createElement('div');
        pane.id = `pane-${toolId}`;
        pane.className = 'view-pane w-full h-full no-scrollbar';
        singleAppHost.appendChild(pane);

        try {
            currentLoadingToolId = toolId;
            const module = await import(`./tools/${toolId}/index.js`).catch(() => import(`../tools/${toolId}/index.js`));
            if (module.template) pane.innerHTML = module.template();
            if (module.init) module.init(pane);
        } catch (e) {
            pane.innerHTML = `<div class="p-6 text-center text-rose-400 text-xs">Không thể khởi tạo: ${e.message}</div>`;
        } finally {
            currentLoadingToolId = null;
        }
    }

    document.querySelectorAll('#single-app-host .view-pane').forEach(p => p.classList.remove('active'));
    pane.classList.add('active');
    singleAppHost.classList.remove('hidden');
    state.activeTabId = toolId;

    if (!state.tabs.some(t => t.toolId === toolId)) {
        state.tabs.push({ tabId: toolId, toolId: toolId });
    }
    renderDesktopTabs();
}
window.openToolGlobal = openTool;

// ==========================================
// ĐA NHIỆM SWITCHER & SPOTLIGHT
// ==========================================
window.openMultitasking = () => {
    if (!switcherCardsWrapper) return;
    const running = state.tabs.filter(t => t.toolId !== 'home');

    switcherCardsWrapper.innerHTML = running.length ? running.map(tab => {
        const tool = getToolData(tab.toolId);
        return `
            <div class="w-[220px] h-[260px] rounded-2xl bg-zinc-900 border border-white/15 p-4 flex flex-col justify-between shrink-0 cursor-pointer active:scale-98 transition-transform"
                 onclick="window.openToolGlobal('${tab.toolId}'); window.closeMultitasking();">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 truncate">
                        <i class="${tool.icon} text-accent-theme text-xs"></i>
                        <span class="font-bold text-xs truncate">${tool.name}</span>
                    </div>
                </div>
                <div class="text-[11px] text-zinc-500 text-center">Bấm để mở lại</div>
                <div class="text-center text-[10px] text-white/40 py-1 bg-white/5 rounded-lg border border-white/5">
                    Đang chạy
                </div>
            </div>
        `;
    }).join('') : `<div class="text-zinc-500 m-auto text-xs">Không có ứng dụng nào đang mở</div>`;

    appSwitcher.classList.remove('pointer-events-none', 'opacity-0');
    appSwitcher.classList.add('opacity-100');
};

window.closeMultitasking = () => {
    appSwitcher.classList.add('pointer-events-none', 'opacity-0');
    appSwitcher.classList.remove('opacity-100');
};

document.getElementById('close-switcher-btn')?.addEventListener('click', window.closeMultitasking);

window.closeAllTabs = () => {
    state.tabs = [{ tabId: 'tab-1', toolId: 'home' }];
    state.activeTabId = 'tab-1';
    singleAppHost.innerHTML = '';
    showHomescreen();
    window.closeMultitasking();
    renderDesktopTabs();
};

function renderDesktopTabs() {
    const desktopTabStrip = document.getElementById('desktop-menubar-tabs');
    if (!desktopTabStrip) return;

    desktopTabStrip.innerHTML = state.tabs.map(tab => {
        const isActive = state.activeTabId === tab.tabId;
        const tool = getToolData(tab.toolId);
        return `
            <div class="px-2.5 py-0.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}" onclick="window.openToolGlobal('${tab.toolId}')">
                <i class="${tool.icon} text-[10px]"></i>
                <span class="truncate max-w-[90px] text-[11px]">${tool.name}</span>
            </div>
        `;
    }).join('');
}

// Spotlight Search & Phím tắt (Cmd+F / Cmd+K / Ctrl+F / Ctrl+K)
const cmdPalette = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const spotlightSectionTitle = document.getElementById('spotlight-section-title');

window.openSpotlight = () => {
    if (!cmdPalette) return;
    cmdPalette.classList.add('spotlight-active');
    cmdInput.value = '';
    renderSpotlightResults(TOOLS.slice(0, 6), true);
    setTimeout(() => cmdInput.focus(), 50);
};

window.closeSpotlight = () => {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('spotlight-active');
    cmdInput.blur();
};

// Lắng nghe phím tắt toàn hệ thống: Cmd+F, Cmd+K (macOS) và Ctrl+F, Ctrl+K (Windows/Linux)
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;

    if (isCmdOrCtrl && (key === 'f' || key === 'k')) {
        // Nếu người dùng đang tập trung gõ trong input khác ngoài spotlight, bỏ qua để họ tìm kiếm nội dung nếu cần
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active !== cmdInput) {
            return;
        }
        e.preventDefault();
        if (cmdPalette?.classList.contains('spotlight-active')) {
            window.closeSpotlight();
        } else {
            window.openSpotlight();
        }
    } else if (e.key === 'Escape' && cmdPalette?.classList.contains('spotlight-active')) {
        window.closeSpotlight();
    }
});

function renderSpotlightResults(list, isSuggestion = false) {
    if (!cmdResults) return;
    spotlightSectionTitle.textContent = isSuggestion ? 'Gợi ý ứng dụng' : `Kết quả tìm kiếm (${list.length})`;

    if (list.length === 0) {
        cmdResults.innerHTML = `<li class="px-4 py-6 text-center text-white/50 text-xs">Không tìm thấy tiện ích</li>`;
        return;
    }

    cmdResults.innerHTML = list.map(t => `
        <li class="px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 cursor-pointer flex items-center justify-between transition-colors" onclick="window.openToolGlobal('${t.id}'); window.closeSpotlight();">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <i class="${t.icon}"></i>
                </div>
                <div class="truncate">
                    <div class="text-xs font-semibold text-white truncate">${t.name}</div>
                    <div class="text-[10px] text-white/50 truncate">${t.desc || 'Tiện ích HunqOS'}</div>
                </div>
            </div>
            <i class="fas fa-arrow-right text-white/30 text-xs"></i>
        </li>
    `).join('');
}

if (cmdInput) {
    cmdInput.oninput = (e) => {
        const val = e.target.value.trim().toLowerCase();
        if (!val) {
            renderSpotlightResults(TOOLS.slice(0, 6), true);
            return;
        }
        renderSpotlightResults(TOOLS.filter(t => t.name.toLowerCase().includes(val) || (t.desc && t.desc.toLowerCase().includes(val))));
    };
}

if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) window.closeSpotlight();
    });
}

// ==========================================
// MINI BUBBLE (MOBUI)
// ==========================================
const miniBubble = document.getElementById('mini-bubble');
if (miniBubble) {
    let lastTapTime = 0;
    let singleTapTimeout = null;
    let autoDimTimer = null;

    function resetBubbleDimTimer() {
        miniBubble.classList.remove('bubble-dimmed');
        clearTimeout(autoDimTimer);
        autoDimTimer = setTimeout(() => {
            miniBubble.classList.add('bubble-dimmed');
        }, 3500);
    }

    resetBubbleDimTimer();
    window.addEventListener('touchstart', resetBubbleDimTimer, { passive: true });
    window.addEventListener('mousemove', resetBubbleDimTimer, { passive: true });

    const handleBubbleTap = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        resetBubbleDimTimer();

        const now = Date.now();
        const timeDiff = now - lastTapTime;

        if (timeDiff < 280) {
            clearTimeout(singleTapTimeout);
            singleTapTimeout = null;
            window.openMultitasking();
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            singleTapTimeout = setTimeout(() => {
                window.goHome();
                singleTapTimeout = null;
            }, 285);
        }
        lastTapTime = now;
    };

    miniBubble.addEventListener('click', handleBubbleTap);
    miniBubble.addEventListener('touchend', handleBubbleTap, { passive: false });
}

// ==========================================
// CÀI ĐẶT & HỆ THỐNG
// ==========================================
const settingsModal = document.getElementById('settings-modal');
window.openSettings = () => {
    updateStorageInfo();
    settingsModal?.classList.add('active');
};
window.closeSettings = () => settingsModal?.classList.remove('active');

let isStatusbarEnabled = localStorage.getItem('hunqos_statusbar_visible') !== 'false';
function applyStatusbarVisibility(visible) {
    document.body.classList.toggle('hide-statusbar', !visible);
    document.getElementById('toggle-statusbar-setting')?.classList.toggle('active', visible);
}
applyStatusbarVisibility(isStatusbarEnabled);

document.getElementById('toggle-statusbar-setting')?.addEventListener('click', () => {
    isStatusbarEnabled = !isStatusbarEnabled;
    localStorage.setItem('hunqos_statusbar_visible', isStatusbarEnabled);
    applyStatusbarVisibility(isStatusbarEnabled);
});

let navMode = localStorage.getItem('hunqos_nav_mode') || 'bubble';
function applyNavigationMode(mode) {
    navMode = mode;
    const isAndroid = mode === 'android';
    document.body.classList.toggle('nav-mode-android', isAndroid);

    const btnBubble = document.getElementById('nav-mode-btn-bubble');
    const btnAndroid = document.getElementById('nav-mode-btn-android');

    if (btnBubble && btnAndroid) {
        btnBubble.classList.toggle('bg-accent-theme', !isAndroid);
        btnBubble.classList.toggle('bg-white/10', isAndroid);
        btnAndroid.classList.toggle('bg-accent-theme', isAndroid);
        btnAndroid.classList.toggle('bg-white/10', !isAndroid);
    }
}
applyNavigationMode(navMode);

window.setNavigationMode = (mode) => {
    localStorage.setItem('hunqos_nav_mode', mode);
    applyNavigationMode(mode);
    UI.showAlert('Điều hướng MobUI', mode === 'android' ? 'Đã bật thanh 3 phím.' : 'Đã bật bóng nổi Mini Bubble.', 'info');
};

window.factoryResetOS = () => {
    UI.showConfirm('Đặt lại toàn bộ?', 'Mọi thiết lập bố cục icon và dữ liệu sẽ trở về mặc định.', async () => {
        if (dbInstance) {
            dbInstance.close();
            dbInstance = null;
        }
        try {
            indexedDB.deleteDatabase(DB_NAME);
        } catch (e) {}
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    });
};

function updateOSClock() {
    const clock = document.getElementById('os-clock');
    const now = new Date();
    if (clock) {
        clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    if (isPureMinimal) updatePureMinimalClock();
}
setInterval(updateOSClock, 1000);
updateOSClock();

if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        const update = () => {
            const el = document.getElementById('battery-percent');
            if (el) el.textContent = `${Math.round(battery.level * 100)}%`;
        };
        update();
        battery.addEventListener('levelchange', update);
    });
}

async function initHunqOS() {
    applyPureMinimalMode(isPureMinimal);
    applySystemAccent(currentAccentColor);
    applyDarkMode(isDarkMode);
    applyNavigationMode(navMode);
    detectDeviceMode();
    await syncWallpaperDisplay();
    renderDock();
    initHomescreenPages();
    showHomescreen();
}

window.addEventListener('resize', () => {
    detectDeviceMode();
    initHomescreenPages();
    renderDesktopTabs();
});

initHunqOS();