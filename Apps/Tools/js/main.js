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
// QUẢN LÝ HÌNH NỀN (INDEXEDDB / LOCALSTORAGE & ĐỔI ẢNH)
// ==========================================
const DB_NAME = 'HunqOS_DB';
const DB_STORE = 'settings';
let dbInstance = null;
let currentCustomWallpaper = null;

const DEFAULT_WP_DARK = 'radial-gradient(circle at 15% 15%, #064e3b 0%, #06241b 45%, #020f0b 100%)';
const DEFAULT_WP_LIGHT = 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)';

let isDarkMode = localStorage.getItem('hunqos_darkmode') !== 'false';

function getDefaultWallpaper() {
    return isDarkMode ? DEFAULT_WP_DARK : DEFAULT_WP_LIGHT;
}

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

    if (isMinimalUI) {
        wallpaperLayer.style.backgroundImage = 'none';
        return;
    }

    if (currentCustomWallpaper === null) {
        currentCustomWallpaper = await getWallpaperFromDB();
    }

    if (currentCustomWallpaper && !currentCustomWallpaper.startsWith('radial-gradient') && !currentCustomWallpaper.startsWith('linear-gradient')) {
        wallpaperLayer.style.backgroundImage = `url('${currentCustomWallpaper}')`;
    } else {
        wallpaperLayer.style.backgroundImage = getDefaultWallpaper();
    }
}

function applyWallpaper(wp) {
    currentCustomWallpaper = wp;
    if (!wallpaperLayer) return;

    if (wp && !wp.startsWith('radial-gradient') && !wp.startsWith('linear-gradient')) {
        wallpaperLayer.style.backgroundImage = `url('${wp}')`;
    } else {
        wallpaperLayer.style.backgroundImage = getDefaultWallpaper();
    }
}

window.resetWallpaper = async () => {
    currentCustomWallpaper = null;
    await saveWallpaperToDB(null);
    localStorage.removeItem('hunqos_custom_wp');
    applyWallpaper(getDefaultWallpaper());
    UI.showAlert('Hình nền', 'Đã khôi phục hình nền mặc định.', 'info');
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
// CẤU HÌNH THEME & BỘ PHÂN GIẢI MÀU NỀN ĐƠN / GRADIENT
// ==========================================
let storedColorMode = localStorage.getItem('hunqos_icon_colormode') || 'white';
if (storedColorMode === 'accent') {
    storedColorMode = 'white';
    localStorage.setItem('hunqos_icon_colormode', 'white');
}

const themeConfig = {
    shape: localStorage.getItem('hunqos_icon_shape') || 'rounded',
    bgMode: localStorage.getItem('hunqos_icon_bgmode') || 'default',
    customBg: localStorage.getItem('hunqos_icon_custom_bg') || '#10b981',
    colorMode: storedColorMode,
    customColor: localStorage.getItem('hunqos_icon_custom_color') || '#ffffff'
};

function applyThemeShape() {
    document.documentElement.classList.remove('shape-rounded', 'shape-circle', 'shape-square');
    document.documentElement.classList.add(`shape-${themeConfig.shape}`);

    ['rounded', 'circle', 'square'].forEach(s => {
        const btn = document.getElementById(`shape-btn-${s}`);
        if (btn) {
            btn.className = (s === themeConfig.shape)
                ? "py-2 px-2 text-xs rounded-xl bg-accent-theme text-white font-medium text-center"
                : "py-2 px-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
        }
    });
}

function updateThemeUIControls() {
    ['default', 'config', 'custom'].forEach(m => {
        const btn = document.getElementById(`bgmode-btn-${m}`);
        if (btn) {
            btn.className = (m === themeConfig.bgMode)
                ? "py-2 px-1 text-xs rounded-xl bg-accent-theme text-white font-medium text-center"
                : "py-2 px-1 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
        }
    });

    ['white', 'config', 'custom'].forEach(m => {
        const btn = document.getElementById(`colormode-btn-${m}`);
        if (btn) {
            btn.className = (m === themeConfig.colorMode)
                ? "py-2 px-1 text-xs rounded-xl bg-accent-theme text-white font-medium text-center"
                : "py-2 px-1 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
        }
    });

    const customBgWrap = document.getElementById('custom-bg-picker-wrap');
    if (customBgWrap) customBgWrap.classList.toggle('hidden', themeConfig.bgMode !== 'custom');

    const customIconWrap = document.getElementById('custom-icon-picker-wrap');
    if (customIconWrap) customIconWrap.classList.toggle('hidden', themeConfig.colorMode !== 'custom');
}

/**
 * Trợ thủ phân tích màu sắc: Tự nhận diện mã màu đơn sắc hay gradient để xuất CSS chuẩn
 */
function resolveColorCss(colorValue, isBackground = true) {
    if (!colorValue || typeof colorValue !== 'string') return '';
    const trimmed = colorValue.trim();
    const isGrad = trimmed.includes('gradient(');

    if (isBackground) {
        return isGrad ? `background-image: ${trimmed};` : `background-color: ${trimmed};`;
    }
    return isGrad ? `background-image: ${trimmed};` : `color: ${trimmed};`;
}

/**
 * Tính toán Style Icon: Xử lý mượt mà cả bgColor đơn sắc và gradient
 */
function computeIconStyles(tool) {
    let bgStyle = '';

    if (isMinimalUI) {
        bgStyle = 'background-color: #09090b; border: 1px solid rgba(255, 255, 255, 0.2);';
    } else if (themeConfig.bgMode === 'default' || themeConfig.bgMode === 'config') {
        const rawColor = tool.bgColor || tool.color || 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
        bgStyle = resolveColorCss(rawColor, true);
    } else if (themeConfig.bgMode === 'custom') {
        bgStyle = resolveColorCss(themeConfig.customBg, true);
    }

    let iconStyle = '';
    let iconClass = '';
    let chosenColor = '#ffffff';

    if (isMinimalUI) {
        chosenColor = '#ffffff';
    } else if (themeConfig.colorMode === 'white') {
        chosenColor = '#ffffff';
    } else if (themeConfig.colorMode === 'config') {
        chosenColor = tool.iconColor || '#ffffff';
    } else if (themeConfig.colorMode === 'custom') {
        chosenColor = themeConfig.customColor || '#ffffff';
    }

    if (chosenColor.includes('gradient(')) {
        iconClass = 'icon-gradient-text';
        iconStyle = `background-image: ${chosenColor};`;
    } else {
        iconStyle = `color: ${chosenColor};`;
    }

    return { bgStyle, iconStyle, iconClass };
}

window.setIconShape = (shape) => {
    themeConfig.shape = shape;
    localStorage.setItem('hunqos_icon_shape', shape);
    applyThemeShape();
    UI.showAlert('Dáng icon', `Đã đổi dáng biểu tượng.`, 'success');
};

window.setIconBgMode = (mode) => {
    themeConfig.bgMode = mode;
    localStorage.setItem('hunqos_icon_bgmode', mode);
    updateThemeUIControls();
    initHomescreenPages();
    renderDock();
    UI.showAlert('Nền Icon', `Đã đổi kiểu màu nền icon.`, 'success');
};

window.applyCustomBg = () => {
    const textVal = document.getElementById('custom-bg-text-input')?.value.trim();
    const colorVal = document.getElementById('custom-bg-color-input')?.value;
    const finalVal = textVal || colorVal;
    themeConfig.customBg = finalVal;
    localStorage.setItem('hunqos_icon_custom_bg', finalVal);
    initHomescreenPages();
    renderDock();
    UI.showAlert('Nền Icon', `Đã lưu màu nền tùy chọn.`, 'success');
};

window.setIconColorMode = (mode) => {
    themeConfig.colorMode = mode;
    localStorage.setItem('hunqos_icon_colormode', mode);
    updateThemeUIControls();
    initHomescreenPages();
    renderDock();
    UI.showAlert('Biểu tượng', `Đã đổi màu biểu tượng.`, 'success');
};

window.applyCustomIconColor = () => {
    const textVal = document.getElementById('custom-icon-text-input')?.value.trim();
    const colorVal = document.getElementById('custom-icon-color-input')?.value;
    const finalVal = textVal || colorVal;
    themeConfig.customColor = finalVal;
    localStorage.setItem('hunqos_icon_custom_color', finalVal);
    initHomescreenPages();
    renderDock();
    UI.showAlert('Biểu tượng', `Đã lưu màu biểu tượng tùy chọn.`, 'success');
};

// ==========================================
// QUẢN LÝ BỐ CỤC THEO DANH MỤC CATID
// ==========================================
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
        layout[pageIdx] = {
            catId: 'other',
            title: 'Ứng dụng khác',
            icon: 'fas fa-th-large',
            tools: remainingTools
        };
    }

    return layout;
}

function getStoredPageLayout() {
    const raw = localStorage.getItem('hunqos_page_layout_v14');
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {}
    }
    return createLayoutFromCategories();
}

let pageLayout = getStoredPageLayout();
let selectedOrganizerPage = 0;
let selectedToolsForBatch = new Set();

function savePageLayout() {
    localStorage.setItem('hunqos_page_layout_v14', JSON.stringify(pageLayout));
}

function getPageCount() {
    const keys = Object.keys(pageLayout).map(Number);
    return Math.max(1, keys.length > 0 ? Math.max(...keys) + 1 : 1);
}

window.autoOrganizeByCategories = () => {
    pageLayout = createLayoutFromCategories();
    selectedOrganizerPage = 0;
    selectedToolsForBatch.clear();
    savePageLayout();
    initHomescreenPages();
    UI.showAlert('Bố cục danh mục', 'Đã tự động gom nhóm ứng dụng theo danh mục chuẩn.', 'success');
};

// ==========================================
// MINIMALUI & ACCENT
// ==========================================
let isMinimalUI = localStorage.getItem('hunqos_minimal_ui') === 'true';
function applyMinimalUI(enable) {
    isMinimalUI = enable;
    document.body.classList.toggle('minimal-ui', enable);
    document.getElementById('toggle-minimal-setting')?.classList.toggle('active', enable);
    syncWallpaperDisplay();
}

document.getElementById('toggle-minimal-setting')?.addEventListener('click', () => {
    isMinimalUI = !isMinimalUI;
    localStorage.setItem('hunqos_minimal_ui', isMinimalUI);
    applyMinimalUI(isMinimalUI);
    UI.showAlert('MinimalUI', isMinimalUI ? 'Đã kích hoạt chế độ siêu tối giản OLED.' : 'Đã trở về giao diện chuẩn.', 'info');
});

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
// THIẾT LẬP THIẾT BỊ
// ==========================================
function detectDeviceMode() {
    const w = window.innerWidth;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const mode = (w >= 1024 && !isTouch) ? 'desktop' : (w >= 680 && isTouch ? 'tablet' : 'phone');
    document.documentElement.setAttribute('data-device-mode', mode);
    return mode;
}

function getGridColumns() {
    const mode = detectDeviceMode();
    const isLandscape = window.innerWidth > window.innerHeight;
    if (mode === 'desktop') return 8;
    if (mode === 'tablet') return 6;
    if (isLandscape) return 6;
    return 4;
}

// ==========================================
// STATUS BAR & DARK MODE
// ==========================================
function updateStatusbarBackground() {
    const topBar = document.getElementById('top-system-bar');
    const bottomNav = document.getElementById('bottom-nav-container');
    const isHome = !contentsContainer || contentsContainer.classList.contains('hidden') || contentsContainer.style.display === 'none';

    if (topBar) {
        topBar.classList.remove('statusbar-home', 'statusbar-app-dark', 'statusbar-app-light');
        topBar.classList.add(isHome ? 'statusbar-home' : (isDarkMode ? 'statusbar-app-dark' : 'statusbar-app-light'));
    }

    if (bottomNav) {
        bottomNav.classList.remove('nav-home', 'nav-app-dark', 'nav-app-light');
        bottomNav.classList.add(isHome ? 'nav-home' : (isDarkMode ? 'nav-app-dark' : 'nav-app-light'));
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
    UI.showAlert('Giao diện', `Đã chuyển sang nền ${isDarkMode ? 'Tối' : 'Sáng'}.`, 'info');
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
        const isHomeBtn = item.id === 'home';

        if (isHomeBtn) {
            return `
                <button onclick="window.openToolGlobal('${item.id}')" class="dock-item bg-white text-zinc-900 flex items-center justify-center text-lg active:scale-95 transition-transform" title="${tool.name}">
                    <i class="${tool.icon}"></i>
                </button>
            `;
        }

        // Tự động giải mã màu đơn sắc hoặc gradient cho Dock item
        const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);

        return `
            <button onclick="window.openToolGlobal('${item.id}')" class="dock-item flex items-center justify-center text-lg active:scale-95 transition-transform border border-white/20 shadow-md" style="${bgStyle}" title="${tool.name}">
                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
            </button>
        `;
    }).join('');
}

// ==========================================
// HOMESCREEN LAUNCHER (TÍCH HỢP MÀU NỀN ĐƠN & GRADIENT)
// ==========================================
let currentPageIndex = 0;
let totalPages = 1;

function initHomescreenPages() {
    const pagesSlider = document.getElementById('launcher-pages-slider');
    if (!pagesSlider) return;

    const rawPageCount = getPageCount();
    totalPages = 1 + rawPageCount;
    const cols = getGridColumns();
    pagesSlider.innerHTML = '';

    // TRANG 0: GỢI Ý & GẦN ĐÂY
    const pageZeroEl = document.createElement('div');
    pageZeroEl.className = 'launcher-page no-scrollbar';

    const recentIds = getRecentToolIds();
    const recentTools = recentIds.map(id => getToolData(id)).filter(Boolean);
    const suggestedTools = TOOLS.slice(0, 8);

    let p0Html = `
        <div class="page-category-header">
            <div class="page-category-badge">
                <i class="fas fa-sparkles text-amber-400"></i>
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

function renderPageDots() {
    const pageDotsContainer = document.getElementById('page-dots');
    if (!pageDotsContainer) return;
    pageDotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = `page-dot-btn ${i === currentPageIndex ? 'active' : 'inactive'}`;
        dot.title = i === 0 ? 'Gợi ý & Gần đây' : (pageLayout[i - 1]?.title || `Trang ${i}`);
        dot.onclick = () => goToPage(i);
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
        <div class="flex items-center gap-2 mb-2.5 p-2 bg-black/30 rounded-lg border border-white/5">
            <span class="text-xs text-white/50 shrink-0">Đổi tên trang:</span>
            <input type="text" value="${currentPageData.title || ''}" 
                   onchange="window.renamePageCategory(${selectedOrganizerPage}, this.value)"
                   placeholder="Nhập tên trang..." 
                   class="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent-theme">
        </div>
    `;

    if (countBadge) {
        countBadge.textContent = `Đã chọn ${selectedToolsForBatch.size} app`;
    }

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
    if (selectedToolsForBatch.has(toolId)) {
        selectedToolsForBatch.delete(toolId);
    } else {
        selectedToolsForBatch.add(toolId);
    }
    renderPageOrganizer();
};

window.toggleSelectAllTools = () => {
    const currentToolIds = pageLayout[selectedOrganizerPage]?.tools || [];
    const allSelected = currentToolIds.length > 0 && currentToolIds.every(id => selectedToolsForBatch.has(id));

    if (allSelected) {
        currentToolIds.forEach(id => selectedToolsForBatch.delete(id));
    } else {
        currentToolIds.forEach(id => selectedToolsForBatch.add(id));
    }
    renderPageOrganizer();
};

window.applyBatchMove = () => {
    const targetSelect = document.getElementById('batch-target-page-select');
    if (!targetSelect || selectedToolsForBatch.size === 0) {
        UI.showAlert('Lưu ý', 'Hãy tích chọn ít nhất 1 ứng dụng trước khi chuyển.', 'warning');
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
    UI.showAlert('Đã chuyển xong', `Đã chuyển ${movedCount} ứng dụng sang ${pageLayout[toPage].title}.`, 'success');
};

window.renamePageCategory = (pageIndex, newTitle) => {
    if (!pageLayout[pageIndex]) return;
    pageLayout[pageIndex].title = newTitle.trim() || `Trang ${pageIndex + 1}`;
    savePageLayout();
    initHomescreenPages();
    UI.showAlert('Đổi tên trang', `Đã cập nhật thành: ${pageLayout[pageIndex].title}`, 'success');
};

window.selectOrganizerPage = (p) => {
    selectedOrganizerPage = p;
    selectedToolsForBatch.clear();
    renderPageOrganizer();
};

window.addNewPageSetting = () => {
    const nextPageIndex = getPageCount();
    pageLayout[nextPageIndex] = {
        title: `Trang ${nextPageIndex + 1}`,
        icon: 'fas fa-folder-plus',
        tools: []
    };
    selectedOrganizerPage = nextPageIndex;
    selectedToolsForBatch.clear();
    savePageLayout();
    initHomescreenPages();
    UI.showAlert('Trang mới', 'Đã tạo trang mới.', 'info');
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
    UI.showAlert('Bố cục', 'Đã xóa trang rỗng.', 'info');
};

// ==========================================
// WORKSPACE, APP LAUNCHER & ĐIỀU HƯỚNG
// ==========================================
const state = {
    tabs: [{ tabId: 'tab-1', toolId: 'home' }],
    activeTabId: 'tab-1'
};

function showHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.add('hidden');
        contentsContainer.style.display = 'none';
    }
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher) {
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

window.goHome = () => {
    window.closeMultitasking();
    state.activeTabId = 'tab-1';
    showHomescreen();
};

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
            const module = await import(`../tools/${toolId}/index.js`);
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
    state.activeTabId = toolId;

    if (!state.tabs.some(t => t.toolId === toolId)) {
        state.tabs.push({ tabId: toolId, toolId: toolId });
    }
    renderDesktopTabs();
}
window.openToolGlobal = openTool;

// ==========================================
// ĐA NHIỆM & SPOTLIGHT
// ==========================================
window.openMultitasking = () => {
    if (!switcherCardsWrapper) return;
    const running = state.tabs.filter(t => t.toolId !== 'home');

    switcherCardsWrapper.innerHTML = running.length ? running.map(tab => {
        const tool = getToolData(tab.toolId);
        return `
            <div onclick="window.openToolGlobal('${tab.toolId}'); window.closeMultitasking();" 
                 class="w-[200px] h-[260px] rounded-2xl bg-zinc-900 border border-white/15 p-4 flex flex-col justify-between shrink-0 cursor-pointer active:scale-95 transition-transform">
                <div class="flex items-center gap-2">
                    <i class="${tool.icon} text-accent-theme"></i>
                    <span class="font-bold text-xs truncate">${tool.name}</span>
                </div>
                <div class="text-[11px] text-zinc-500 text-center">Chạm để mở lại</div>
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

// Spotlight
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

// Cử chỉ Home Bar
const homeBar = document.getElementById('home-bar-touch-area');
if (homeBar) {
    homeBar.addEventListener('click', () => {
        const homescreenLauncher = document.getElementById('homescreen-launcher');
        if (homescreenLauncher && homescreenLauncher.style.display === 'none') {
            window.goHome();
        } else {
            window.openMultitasking();
        }
    });
}

// ==========================================
// CÀI ĐẶT & HỆ THỐNG
// ==========================================
const settingsModal = document.getElementById('settings-modal');
window.openSettings = () => settingsModal?.classList.add('active');
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

let navMode = localStorage.getItem('hunqos_nav_mode') || 'homebar';
function applyNavigationMode(mode) {
    navMode = mode;
    const isAndroid = mode === 'android';
    document.body.classList.toggle('nav-mode-android', isAndroid);

    const btnHomebar = document.getElementById('nav-mode-btn-homebar');
    const btnAndroid = document.getElementById('nav-mode-btn-android');

    if (btnHomebar && btnAndroid) {
        btnHomebar.classList.toggle('bg-accent-theme', !isAndroid);
        btnHomebar.classList.toggle('bg-white/10', isAndroid);
        btnAndroid.classList.toggle('bg-accent-theme', isAndroid);
        btnAndroid.classList.toggle('bg-white/10', !isAndroid);
    }
}
applyNavigationMode(navMode);

window.setNavigationMode = (mode) => {
    localStorage.setItem('hunqos_nav_mode', mode);
    applyNavigationMode(mode);
    UI.showAlert('Điều hướng', mode === 'android' ? 'Đã bật 3 phím điều hướng.' : 'Đã bật thanh Home Bar.', 'info');
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
    applyMinimalUI(isMinimalUI);
    applySystemAccent(currentAccentColor);
    applyThemeShape();
    updateThemeUIControls();
    applyDarkMode(isDarkMode);
    applyNavigationMode(navMode);
    detectDeviceMode();
    await syncWallpaperDisplay();
    renderDock();
    initHomescreenPages();
    showHomescreen();
}

window.addEventListener('resize', () => {
    initHomescreenPages();
});

initHunqOS();