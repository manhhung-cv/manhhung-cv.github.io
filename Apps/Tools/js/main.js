import { CATEGORIES as CONFIG_CATEGORIES, TOOLS } from './config.js';
import { UI } from './ui.js';

// ==========================================
// KHAI BÁO CÁC DOM CONTAINER CỐT LÕI (TRÁNH LỖI HOISTING/TDZ)
// ==========================================
const contentsContainer = document.getElementById('tab-contents-container');
const singleAppHost = document.getElementById('single-app-host');
const splitAppHost = document.getElementById('split-app-host');
const splitLeftPane = document.getElementById('split-left-pane');
const splitRightPane = document.getElementById('split-right-pane');
const appSwitcher = document.getElementById('app-switcher');
const switcherCardsWrapper = document.getElementById('switcher-cards-wrapper');
const wallpaperLayer = document.getElementById('wallpaper-layer');

// ==========================================
// 0. NHẬN DIỆN THIẾT BỊ VÀ THIẾT LẬP LƯỚI MA TRẬN
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
    } else if (w >= 680 && isTouch) {
        mode = 'tablet';  // TabUI
    } else {
        mode = 'phone';   // MobiUI
    }

    document.documentElement.setAttribute('data-device-mode', mode);
    return mode;
}

function getGridDimensions() {
    const mode = detectDeviceMode();
    const isLandscape = window.innerWidth > window.innerHeight;

    if (mode === 'desktop') return { rows: 6, cols: 10, key: 'hunqos_layout_dex_v5' };
    if (mode === 'tablet') return { rows: 4, cols: 6, key: 'hunqos_layout_tab_v5' };
    if (isLandscape) return { rows: 3, cols: 6, key: 'hunqos_layout_mobi_land_v5' };
    return { rows: 6, cols: 4, key: 'hunqos_layout_mobi_v5' };
}

let activeGrid = getGridDimensions();

window.setForcedDeviceMode = (mode) => {
    forcedDeviceMode = mode;
    localStorage.setItem('hunqos_device_mode', mode);

    const modeLabels = {
        'auto': 'Tự động',
        'phone': 'MobiUI',
        'tablet': 'TabUI',
        'desktop': 'DexUI'
    };

    ['auto', 'phone', 'tablet', 'desktop'].forEach(m => {
        const btn = document.getElementById(`mode-btn-${m}`);
        if (btn) {
            if (m === mode) {
                btn.className = "py-2 px-1 text-[11px] rounded-xl bg-indigo-600 text-white font-medium border border-white/20 text-center";
            } else {
                btn.className = "py-2 px-1 text-[11px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
            }
        }
    });

    detectDeviceMode();
    activeGrid = getGridDimensions();
    homeLayout = getInitialLayout();
    currentPageIndex = 0;
    initHomescreenPages();

    if (mode !== 'auto') {
        UI.showAlert('Lưu ý hiển thị', `Đã chuyển sang ${modeLabels[mode]}. Giao diện có thể lệch tỉ lệ nếu phần cứng không tương thích.`, 'warning');
    } else {
        UI.showAlert('Chế độ giao diện', 'Đã chuyển về chế độ Tự động.', 'success');
    }
};

// ==========================================
// 1. CHẶN MENU CHUỘT PHẢI
// ==========================================
let isContextMenuBlocked = localStorage.getItem('hunqos_block_contextmenu') !== 'false';

function handleContextMenu(e) {
    if (isContextMenuBlocked) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}
function handleSelectStart(e) {
    if (isContextMenuBlocked) {
        e.preventDefault();
        return false;
    }
}
document.addEventListener('contextmenu', handleContextMenu, { capture: true });
document.addEventListener('selectstart', handleSelectStart);

// ==========================================
// 2. GRADIENT XANH LÁ & QUẢN LÝ HÌNH NỀN
// ==========================================
const DB_NAME = 'HunqOS_DB';
const DB_STORE = 'settings';
let dbInstance = null;

const DEFAULT_WP_DARK = 'radial-gradient(circle at 15% 15%, #064e3b 0%, #06241b 45%, #020f0b 100%)';
const DEFAULT_WP_LIGHT = 'radial-gradient(circle at 15% 15%, #d1fae5 0%, #a7f3d0 45%, #6ee7b7 100%)';

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
        localStorage.setItem('system_wallpaper_fallback', val);
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
        return localStorage.getItem('system_wallpaper_fallback');
    }
}

function applyWallpaper(wp) {
    if (!wallpaperLayer) return;

    if (wp && !wp.startsWith('radial-gradient')) {
        wallpaperLayer.style.backgroundImage = `url('${wp}')`;
    } else {
        const activeDefault = getDefaultWallpaper();
        wallpaperLayer.style.backgroundImage = activeDefault;
    }
}

window.resetWallpaper = async () => {
    await saveWallpaperToDB(null);
    applyWallpaper(getDefaultWallpaper());
    UI.showAlert('Hình nền', 'Đã khôi phục nền xanh lá mặc định.', 'info');
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
// 3. DARK MODE & ĐỒNG BỘ STATUS BAR / NỀN
// ==========================================
let isDarkMode = localStorage.getItem('hunqos_darkmode') !== 'false';

function updateStatusbarBackground() {
    const topBar = document.getElementById('top-system-bar');
    if (!topBar) return;

    const container = contentsContainer || document.getElementById('tab-contents-container');
    const isHome = !container || container.classList.contains('hidden') || container.style.display === 'none';

    topBar.classList.remove('statusbar-home', 'statusbar-app-dark', 'statusbar-app-light');

    if (isHome) {
        topBar.classList.add('statusbar-home');
    } else {
        topBar.classList.add(isDarkMode ? 'statusbar-app-dark' : 'statusbar-app-light');
    }
}

function applyDarkMode(enable) {
    const htmlEl = document.documentElement;
    const darkToggleThumb = document.getElementById('darkmode-toggle-thumb');
    const darkToggleBtn = document.getElementById('toggle-darkmode-setting');
    const darkIcon = document.getElementById('darkmode-icon');

    if (enable) {
        htmlEl.classList.add('dark');
        darkToggleThumb?.classList.add('translate-x-6');
        darkToggleBtn?.classList.replace('bg-zinc-700', 'bg-indigo-600');
        if (darkIcon) darkIcon.className = 'fas fa-moon text-indigo-400';
    } else {
        htmlEl.classList.remove('dark');
        darkToggleThumb?.classList.remove('translate-x-6');
        darkToggleBtn?.classList.replace('bg-indigo-600', 'bg-zinc-700');
        if (darkIcon) darkIcon.className = 'fas fa-sun text-amber-400';
    }

    getWallpaperFromDB().then(savedWp => {
        if (!savedWp || savedWp.startsWith('radial-gradient')) {
            applyWallpaper(getDefaultWallpaper());
        }
    });

    updateStatusbarBackground();
}
applyDarkMode(isDarkMode);

document.getElementById('toggle-darkmode-setting')?.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('hunqos_darkmode', isDarkMode);
    applyDarkMode(isDarkMode);
    UI.showAlert('Giao diện', `Đã chuyển sang chế độ ${isDarkMode ? 'Tối' : 'Sáng'}.`, 'info');
});


// ==========================================
// QUẢN LÝ THEME ICON: HÌNH DẠNG & MÀU SẮC
// ==========================================
const themeConfig = {
    shape: localStorage.getItem('hunqos_icon_shape') || 'rounded', // 'rounded' | 'circle' | 'square'
    bgMode: localStorage.getItem('hunqos_icon_bgmode') || 'glass',  // 'glass' | 'config' | 'custom'
    customBg: localStorage.getItem('hunqos_icon_custom_bg') || '#6366f1',
    colorMode: localStorage.getItem('hunqos_icon_colormode') || 'white', // 'white' | 'config' | 'custom'
    customColor: localStorage.getItem('hunqos_icon_custom_color') || '#ffffff'
};

// Áp dụng class hình dạng lên thẻ html
function applyThemeShape() {
    document.documentElement.classList.remove('shape-rounded', 'shape-circle', 'shape-square');
    document.documentElement.classList.add(`shape-${themeConfig.shape}`);

    ['rounded', 'circle', 'square'].forEach(s => {
        const btn = document.getElementById(`shape-btn-${s}`);
        if (btn) {
            if (s === themeConfig.shape) btn.className = "py-1.5 px-2 text-[11px] rounded-xl bg-indigo-600 text-white font-medium border border-white/20 text-center";
            else btn.className = "py-1.5 px-2 text-[11px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
        }
    });
}

// Cập nhật trạng thái nút và khung chọn màu
function updateThemeUIControls() {
    ['glass', 'config', 'custom'].forEach(m => {
        const btn = document.getElementById(`bgmode-btn-${m}`);
        if (btn) {
            if (m === themeConfig.bgMode) btn.className = "py-1.5 px-1 text-[11px] rounded-xl bg-indigo-600 text-white font-medium border border-white/20 text-center";
            else btn.className = "py-1.5 px-1 text-[11px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
        }
    });

    ['white', 'config', 'custom'].forEach(m => {
        const btn = document.getElementById(`colormode-btn-${m}`);
        if (btn) {
            if (m === themeConfig.colorMode) btn.className = "py-1.5 px-1 text-[11px] rounded-xl bg-indigo-600 text-white font-medium border border-white/20 text-center";
            else btn.className = "py-1.5 px-1 text-[11px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center";
        }
    });

    const customBgWrap = document.getElementById('custom-bg-picker-wrap');
    if (customBgWrap) customBgWrap.classList.toggle('hidden', themeConfig.bgMode !== 'custom');

    const customIconWrap = document.getElementById('custom-icon-picker-wrap');
    if (customIconWrap) customIconWrap.classList.toggle('hidden', themeConfig.colorMode !== 'custom');
}

// Helper: Tính toán Style cho Nền và Biểu tượng của Tool
function computeIconStyles(tool) {
    // 1. Màu nền
    let bgStyle = '';
    if (themeConfig.bgMode === 'glass') {
        bgStyle = 'background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.25)); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2);';
    } else if (themeConfig.bgMode === 'config') {
        const colorVal = tool.color || 'linear-gradient(135deg, #6366f1, #4f46e5)';
        bgStyle = colorVal.includes('gradient') ? `background-image: ${colorVal}; border: 1px solid rgba(255,255,255,0.2);` : `background-color: ${colorVal}; border: 1px solid rgba(255,255,255,0.15);`;
    } else if (themeConfig.bgMode === 'custom') {
        const custom = themeConfig.customBg;
        bgStyle = custom.includes('gradient') ? `background-image: ${custom}; border: 1px solid rgba(255,255,255,0.2);` : `background-color: ${custom}; border: 1px solid rgba(255,255,255,0.15);`;
    }

    // 2. Màu biểu tượng
    let iconStyle = '';
    let iconClass = '';
    let chosenColor = '#ffffff';

    if (themeConfig.colorMode === 'config' && tool.iconColor) {
        chosenColor = tool.iconColor;
    } else if (themeConfig.colorMode === 'custom') {
        chosenColor = themeConfig.customColor;
    }

    if (chosenColor.includes('gradient')) {
        iconClass = 'icon-gradient-text';
        iconStyle = `background-image: ${chosenColor};`;
    } else {
        iconStyle = `color: ${chosenColor};`;
    }

    return { bgStyle, iconStyle, iconClass };
}

// Event Setters
window.setIconShape = (shape) => {
    themeConfig.shape = shape;
    localStorage.setItem('hunqos_icon_shape', shape);
    applyThemeShape();
    UI.showAlert('Theme', `Đã đổi hình dạng sang ${shape === 'rounded' ? 'Bo nhẹ' : shape === 'circle' ? 'Tròn' : 'Vuông'}.`, 'success');
};

window.setIconBgMode = (mode) => {
    themeConfig.bgMode = mode;
    localStorage.setItem('hunqos_icon_bgmode', mode);
    updateThemeUIControls();
    initHomescreenPages();
    renderDock();
    UI.showAlert('Theme', `Đã chuyển kiểu màu nền icon.`, 'success');
};

window.applyCustomBg = () => {
    const gradVal = document.getElementById('custom-bg-gradient-input')?.value.trim();
    const colorVal = document.getElementById('custom-bg-color-input')?.value;
    const finalVal = gradVal || colorVal;
    themeConfig.customBg = finalVal;
    localStorage.setItem('hunqos_icon_custom_bg', finalVal);
    initHomescreenPages();
    renderDock();
    UI.showAlert('Theme', `Đã lưu màu nền tùy chọn.`, 'success');
};

window.setIconColorMode = (mode) => {
    themeConfig.colorMode = mode;
    localStorage.setItem('hunqos_icon_colormode', mode);
    updateThemeUIControls();
    initHomescreenPages();
    renderDock();
    UI.showAlert('Theme', `Đã chuyển kiểu màu biểu tượng.`, 'success');
};

window.applyCustomIconColor = () => {
    const gradVal = document.getElementById('custom-icon-gradient-input')?.value.trim();
    const colorVal = document.getElementById('custom-icon-color-input')?.value;
    const finalVal = gradVal || colorVal;
    themeConfig.customColor = finalVal;
    localStorage.setItem('hunqos_icon_custom_color', finalVal);
    initHomescreenPages();
    renderDock();
    UI.showAlert('Theme', `Đã lưu màu biểu tượng tùy chọn.`, 'success');
};





// ==========================================
// 4. CLOCK ENGINE
// ==========================================
let clockMode = localStorage.getItem('hunqos_clock_mode') || 'device';
let customTimezone = localStorage.getItem('hunqos_timezone') || 'Asia/Ho_Chi_Minh';

const clockModeDevice = document.getElementById('clock-mode-device');
const clockModeCustom = document.getElementById('clock-mode-custom');
const timezoneSelect = document.getElementById('timezone-select');

if (clockModeDevice && clockModeCustom && timezoneSelect) {
    if (clockMode === 'device') clockModeDevice.checked = true;
    else clockModeCustom.checked = true;

    timezoneSelect.value = customTimezone;

    clockModeDevice.addEventListener('change', () => {
        clockMode = 'device';
        localStorage.setItem('hunqos_clock_mode', clockMode);
        updateOSClock();
    });

    clockModeCustom.addEventListener('change', () => {
        clockMode = 'custom';
        localStorage.setItem('hunqos_clock_mode', clockMode);
        updateOSClock();
    });

    timezoneSelect.addEventListener('change', (e) => {
        customTimezone = e.target.value;
        localStorage.setItem('hunqos_timezone', customTimezone);
        if (clockMode === 'custom') updateOSClock();
    });
}

function getFormattedTime() {
    const now = new Date();
    if (clockMode === 'custom') {
        try {
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: customTimezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const parts = timeString.split(':');
            return { hours: parts[0], minutes: parts[1], seconds: parts[2] || '00' };
        } catch (e) { }
    }
    return {
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0'),
        seconds: String(now.getSeconds()).padStart(2, '0')
    };
}

function updateOSClock() {
    const clock = document.getElementById('os-clock');
    const { hours, minutes } = getFormattedTime();
    if (clock) clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateOSClock, 1000);
updateOSClock();

// ==========================================
// 5. APPS & TIỆN ÍCH
// ==========================================
function getToolData(toolId) {
    if (toolId === 'home') return { id: 'home', name: 'Bàn làm việc', icon: 'fas fa-home', desc: 'Màn hình chính HunqOS' };
    return TOOLS.find(t => t.id === toolId) || { id: toolId, name: toolId, icon: 'fas fa-cube', desc: 'Ứng dụng' };
}

// ==========================================
// 6. QUẢN LÝ DOCK (KÉO THẢ VÀO / XOÁ KHỎI DOCK)
// ==========================================
const DEFAULT_DOCK = [
    { type: 'tool', id: 'home' },
    { type: 'action', action: 'spotlight', icon: 'fas fa-search', name: 'Tìm kiếm' },
    { type: 'action', action: 'multitask', icon: 'fas fa-layer-group', name: 'Cửa sổ' },
    { type: 'action', action: 'settings', icon: 'fas fa-cog', name: 'Cài đặt' }
];

let dockList = JSON.parse(localStorage.getItem('hunqos_dock_items')) || DEFAULT_DOCK;

function saveDock() {
    localStorage.setItem('hunqos_dock_items', JSON.stringify(dockList));
    renderDock();
}

function renderDock() {
    const container = document.getElementById('dock-items-container');
    if (!container) return;

    container.innerHTML = dockList.map((item, idx) => {
        if (item.type === 'action') {
            let onclickAttr = '';
            let badgeHtml = '';
            let bgClass = 'bg-zinc-800 text-white';

            if (item.action === 'spotlight') onclickAttr = 'window.openSpotlight()';
            else if (item.action === 'multitask') {
                onclickAttr = 'window.openMultitasking()';
                bgClass = 'bg-indigo-600 text-white';
                badgeHtml = `<span id="dock-tab-badge" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white border-2 border-black">${state.tabs.length}</span>`;
            } else if (item.action === 'settings') {
                onclickAttr = 'document.getElementById("open-settings-btn").click()';
            }

            return `
                <div class="relative group">
                    <button onclick="${onclickAttr}" class="dock-item ${bgClass} flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all shadow-md ${isHomeEditMode ? 'jiggling' : ''}" title="${item.name}">
                        <i class="${item.icon}"></i>
                        ${badgeHtml}
                    </button>
                    ${isHomeEditMode ? `
                        <button onclick="window.removeDockItem(${idx})" class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center border border-black shadow">
                            <i class="fas fa-minus"></i>
                        </button>
                    ` : ''}
                </div>
            `;
        }

        const tool = getToolData(item.id);
        const isHomeBtn = item.id === 'home';
        const bgClass = isHomeBtn ? 'bg-white text-zinc-900' : 'bg-gradient-to-tr from-white/15 to-white/30 border border-white/20 text-white';

        return `
            <div class="relative group" draggable="true" ondragstart="window.handleDockDragStart(event, ${idx})">
                <button onclick="window.openToolGlobal('${item.id}')" class="dock-item ${bgClass} flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all shadow-md ${isHomeEditMode ? 'jiggling' : ''}" title="${tool.name}">
                    <i class="${tool.icon}"></i>
                </button>
                ${isHomeEditMode ? `
                    <button onclick="window.removeDockItem(${idx})" class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center border border-black shadow">
                        <i class="fas fa-minus"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

window.removeDockItem = (index) => {
    dockList.splice(index, 1);
    saveDock();
    UI.showAlert('Dock', 'Đã gỡ biểu tượng khỏi Dock.', 'info');
};

window.handleDockDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ from: 'dock', index }));
};

const dockElement = document.getElementById('hunqos-dock');
if (dockElement) {
    dockElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        dockElement.classList.add('dock-hover-target');
    });
    dockElement.addEventListener('dragleave', () => {
        dockElement.classList.remove('dock-hover-target');
    });
    dockElement.addEventListener('drop', (e) => {
        e.preventDefault();
        dockElement.classList.remove('dock-hover-target');
        const raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            if (data.from === 'launcher') {
                if (dockList.some(d => d.id === data.id)) {
                    UI.showAlert('Dock', 'Ứng dụng đã có sẵn trên Dock.', 'warning');
                    return;
                }
                dockList.push({ type: 'tool', id: data.id });
                saveDock();
                UI.showAlert('Dock', 'Đã thêm ứng dụng vào Dock.', 'success');
            }
        } catch (err) { }
    });
}

// ==========================================
// 7. SẮP XẾP TỰ DO ICON (ROW x COL) & PHÂN TRANG
// ==========================================
let homeLayout = [];
let currentPageIndex = 0;
let totalPages = 1;
let isHomeEditMode = false;
let draggedItemInfo = null;

function getInitialLayout() {
    const raw = localStorage.getItem(activeGrid.key);
    if (raw) {
        try { return JSON.parse(raw); } catch (e) { }
    }

    const layout = [];
    let p = 0, r = 0, c = 0;

    TOOLS.forEach(t => {
        layout.push({ id: t.id, page: p, row: r, col: c });
        c++;
        if (c >= activeGrid.cols) {
            c = 0;
            r++;
        }
        if (r >= activeGrid.rows) {
            p++;
            r = 0;
            c = 0;
        }
    });

    return layout;
}

function saveHomeLayout() {
    localStorage.setItem(activeGrid.key, JSON.stringify(homeLayout));
}

window.resetLayout = () => {
    localStorage.removeItem(activeGrid.key);
    localStorage.removeItem('hunqos_dock_items');
    dockList = [...DEFAULT_DOCK];
    homeLayout = getInitialLayout();
    currentPageIndex = 0;
    saveDock();
    initHomescreenPages();
    UI.showAlert('Đã khôi phục', 'Bố cục biểu tượng và Dock đã được đặt lại mặc định.', 'success');
};

window.addNewPage = () => {
    totalPages++;
    renderPageDots();
    goToPage(totalPages - 1);
    UI.showAlert('Trang mới', `Đã tạo Trang ${totalPages}. Bạn có thể kéo thả icon vào đây.`, 'success');
};

window.enterHomeEditMode = () => {
    isHomeEditMode = true;
    document.getElementById('edit-done-btn')?.classList.remove('hidden');
    document.querySelectorAll('.home-item').forEach(el => el.classList.add('jiggling'));
    renderDock();
};

window.exitHomeEditMode = () => {
    isHomeEditMode = false;
    document.getElementById('edit-done-btn')?.classList.add('hidden');
    document.querySelectorAll('.home-item').forEach(el => el.classList.remove('jiggling'));
    renderDock();
};

const edgeLeft = document.getElementById('edge-left');
const edgeRight = document.getElementById('edge-right');
let edgeTimer = null;

function initHomescreenPages() {
    const pagesSlider = document.getElementById('launcher-pages-slider');
    if (!pagesSlider) return;

    activeGrid = getGridDimensions();

    const maxPageInLayout = homeLayout.reduce((m, it) => Math.max(m, it.page), 0);
    totalPages = Math.max(totalPages, maxPageInLayout + 1);

    if (currentPageIndex >= totalPages) currentPageIndex = totalPages - 1;

    pagesSlider.innerHTML = '';

    for (let p = 0; p < totalPages; p++) {
        const pageEl = document.createElement('div');
        pageEl.className = 'launcher-page';
        pageEl.dataset.page = p;

        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-layer-container';

        const gridLayer = document.createElement('div');
        gridLayer.className = 'grid-layer';
        gridLayer.style.gridTemplateColumns = `repeat(${activeGrid.cols}, 1fr)`;
        gridLayer.style.gridTemplateRows = `repeat(${activeGrid.rows}, 1fr)`;

        // Tạo lưới tọa độ tự do
        for (let r = 0; r < activeGrid.rows; r++) {
            for (let c = 0; c < activeGrid.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.page = p;
                cell.dataset.row = r;
                cell.dataset.col = c;

                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    cell.classList.add('cell-hover-target');
                });
                cell.addEventListener('dragleave', () => {
                    cell.classList.remove('cell-hover-target');
                });
                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    cell.classList.remove('cell-hover-target');
                    handleDropOnCell(p, r, c);
                });

                // Tìm icon tại vị trí này
                const item = homeLayout.find(it => it.page === p && it.row === r && it.col === c);
                if (item) {
                    const tool = getToolData(item.id);
                    const itemEl = document.createElement('div');
                    itemEl.draggable = true;
                    itemEl.className = `home-item cursor-pointer select-none ${isHomeEditMode ? 'jiggling' : ''}`;
                    itemEl.dataset.id = item.id;
                    const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);

                    itemEl.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center group">
                            <div class="app-icon-box relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-lg group-hover:scale-105 active:scale-95 transition-all"
                                style="${bgStyle}">
                                <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                            </div>
                            <span class="app-icon-label mt-1.5 text-[10px] sm:text-[11px] font-medium text-white/90 tracking-tight text-center truncate w-16 sm:w-20 drop-shadow">${tool.name}</span>
                        </div>
                    `;
                    itemEl.onclick = () => {
                        if (isHomeEditMode) return;
                        window.openToolGlobal(item.id);
                    };

                    // Bắt đầu kéo icon
                    itemEl.addEventListener('dragstart', (e) => {
                        draggedItemInfo = { from: 'launcher', id: item.id };
                        e.dataTransfer.setData('text/plain', JSON.stringify(draggedItemInfo));
                        itemEl.classList.add('dragging-item');
                        edgeLeft?.classList.add('active-dnd');
                        edgeRight?.classList.add('active-dnd');
                    });

                    itemEl.addEventListener('dragend', () => {
                        itemEl.classList.remove('dragging-item');
                        draggedItemInfo = null;
                        clearTimeout(edgeTimer);
                        edgeLeft?.classList.remove('active-dnd');
                        edgeRight?.classList.remove('active-dnd');
                    });

                    // Chạm giữ để kích hoạt chế độ chỉnh sửa
                    attachLongPress(itemEl);

                    cell.appendChild(itemEl);
                }

                gridLayer.appendChild(cell);
            }
        }

        gridContainer.appendChild(gridLayer);
        pageEl.appendChild(gridContainer);
        pagesSlider.appendChild(pageEl);
    }

    renderPageDots();
    goToPage(currentPageIndex);
}

function handleDropOnCell(targetPage, targetRow, targetCol) {
    if (!draggedItemInfo) return;

    if (draggedItemInfo.from === 'launcher') {
        const id = draggedItemInfo.id;
        const currentItem = homeLayout.find(x => x.id === id);
        if (!currentItem) return;

        // Nếu ô mục tiêu đã có icon, đổi vị trí (swap)
        const targetItem = homeLayout.find(x => x.page === targetPage && x.row === targetRow && x.col === targetCol);
        if (targetItem) {
            targetItem.page = currentItem.page;
            targetItem.row = currentItem.row;
            targetItem.col = currentItem.col;
        }

        currentItem.page = targetPage;
        currentItem.row = targetRow;
        currentItem.col = targetCol;

        saveHomeLayout();
        initHomescreenPages();
    }
}

// Chạm giữ để vào Edit Mode
function attachLongPress(el) {
    let timer = null;
    el.addEventListener('touchstart', () => {
        timer = setTimeout(() => {
            window.enterHomeEditMode();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 550);
    }, { passive: true });
    el.addEventListener('touchend', () => clearTimeout(timer));
    el.addEventListener('touchmove', () => clearTimeout(timer));

    el.addEventListener('mousedown', () => {
        timer = setTimeout(() => window.enterHomeEditMode(), 550);
    });
    el.addEventListener('mouseup', () => clearTimeout(timer));
    el.addEventListener('mouseleave', () => clearTimeout(timer));
}

// Chuyển trang khi kéo sát mép
if (edgeLeft && edgeRight) {
    edgeLeft.addEventListener('dragover', () => {
        if (!edgeTimer && currentPageIndex > 0) {
            edgeTimer = setTimeout(() => {
                goToPage(currentPageIndex - 1);
                edgeTimer = null;
            }, 600);
        }
    });
    edgeLeft.addEventListener('dragleave', () => {
        clearTimeout(edgeTimer);
        edgeTimer = null;
    });

    edgeRight.addEventListener('dragover', () => {
        if (!edgeTimer && currentPageIndex < totalPages - 1) {
            edgeTimer = setTimeout(() => {
                goToPage(currentPageIndex + 1);
                edgeTimer = null;
            }, 600);
        }
    });
    edgeRight.addEventListener('dragleave', () => {
        clearTimeout(edgeTimer);
        edgeTimer = null;
    });
}

function renderPageDots() {
    const pageDotsContainer = document.getElementById('page-dots');
    if (!pageDotsContainer) return;
    pageDotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        const isActive = i === currentPageIndex;
        dot.className = `page-dot-btn ${isActive ? 'active' : 'inactive'}`;
        dot.title = `Trang ${i + 1}`;
        dot.onclick = (e) => {
            e.stopPropagation();
            goToPage(i);
        };
        pageDotsContainer.appendChild(dot);
    }
}

function goToPage(index) {
    if (index < 0) index = 0;
    if (index >= totalPages) index = totalPages - 1;
    currentPageIndex = index;

    const pagesSlider = document.getElementById('launcher-pages-slider');
    if (pagesSlider) {
        pagesSlider.style.transform = `translateX(-${currentPageIndex * 100}%)`;
    }
    renderPageDots();
}

// Điều hướng vuốt trang & con lăn chuột
const launcherViewport = document.getElementById('launcher-viewport');
let wheelCooldown = false;

if (launcherViewport) {
    launcherViewport.addEventListener('wheel', (e) => {
        const mode = detectDeviceMode();
        if (mode !== 'desktop' || wheelCooldown) return;

        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (Math.abs(delta) > 35) {
            wheelCooldown = true;
            if (delta > 0) goToPage(currentPageIndex + 1);
            else goToPage(currentPageIndex - 1);
            setTimeout(() => { wheelCooldown = false; }, 400);
        }
    }, { passive: true });

    let swipeStartX = 0;
    let swipeStartY = 0;
    let isHorizontalDragging = false;

    launcherViewport.addEventListener('touchstart', e => {
        const mode = detectDeviceMode();
        if (mode === 'desktop' || isHomeEditMode) return;
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
        isHorizontalDragging = true;
    }, { passive: true });

    launcherViewport.addEventListener('touchmove', e => {
        if (!isHorizontalDragging || isHomeEditMode) return;
        const currentX = e.touches[0].clientX;
        const diffX = currentX - swipeStartX;
        const pagesSlider = document.getElementById('launcher-pages-slider');
        if (pagesSlider) {
            pagesSlider.style.transform = `translateX(calc(-${currentPageIndex * 100}% + ${diffX}px))`;
        }
    }, { passive: true });

    launcherViewport.addEventListener('touchend', e => {
        if (!isHorizontalDragging || isHomeEditMode) return;
        isHorizontalDragging = false;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - swipeStartX;
        const diffY = endY - swipeStartY;

        if (diffY > 90 && Math.abs(diffX) < 45) {
            window.openSpotlight();
            return;
        }

        if (diffX > 50) goToPage(currentPageIndex - 1);
        else if (diffX < -50) goToPage(currentPageIndex + 1);
        else goToPage(currentPageIndex);
    });
}

document.addEventListener('keydown', (e) => {
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    const isHomeScreenVisible = !homescreenLauncher.classList.contains('hidden') && homescreenLauncher.style.opacity !== '0';
    if (!isHomeScreenVisible) return;

    if (e.key === 'ArrowLeft') goToPage(currentPageIndex - 1);
    else if (e.key === 'ArrowRight') goToPage(currentPageIndex + 1);
});

// ==========================================
// 8. SPOTLIGHT SEARCH
// ==========================================
const cmdPalette = document.getElementById('cmd-palette');
const spotlightCard = document.getElementById('spotlight-card');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const spotlightSectionTitle = document.getElementById('spotlight-section-title');

window.openSpotlight = () => {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('hidden');
    cmdPalette.classList.replace('opacity-0', 'opacity-100');
    spotlightCard.classList.replace('scale-95', 'scale-100');
    cmdInput.value = '';
    cmdInput.focus();
    renderSpotlightResults(TOOLS.slice(0, 6), true);
};

window.closeSpotlight = () => {
    if (!cmdPalette) return;
    cmdPalette.classList.replace('opacity-100', 'opacity-0');
    spotlightCard.classList.replace('scale-100', 'scale-95');
    setTimeout(() => cmdPalette.classList.add('hidden'), 250);
};

function renderSpotlightResults(list, isSuggestion = false) {
    if (!cmdResults) return;
    spotlightSectionTitle.textContent = isSuggestion ? 'Gợi ý ứng dụng' : `Kết quả tìm kiếm (${list.length})`;

    if (list.length === 0) {
        cmdResults.innerHTML = `<li class="px-4 py-8 text-center text-white/50 text-xs">Không tìm thấy tiện ích phù hợp</li>`;
        return;
    }

    cmdResults.innerHTML = list.map(t => `
        <li class="px-3.5 py-2 rounded-2xl hover:bg-white/10 active:bg-white/20 cursor-pointer flex items-center justify-between transition-colors group" onclick="window.openToolGlobal('${t.id}'); window.closeSpotlight();">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-[14px] bg-white/10 border border-white/15 flex items-center justify-center text-white text-base shrink-0 group-hover:scale-105 transition-transform">
                    <i class="${t.icon}"></i>
                </div>
                <div class="truncate">
                    <div class="text-sm font-semibold text-white truncate">${t.name}</div>
                    <div class="text-[11px] text-white/60 truncate">${t.desc || 'Tiện ích HunqOS'}</div>
                </div>
            </div>
            <i class="fas fa-arrow-right text-white/30 text-xs shrink-0 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
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
        const filtered = TOOLS.filter(t => t.name.toLowerCase().includes(val) || (t.desc && t.desc.toLowerCase().includes(val)));
        renderSpotlightResults(filtered, false);
    };
}

if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) window.closeSpotlight();
    });
}

document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (cmdPalette.classList.contains('hidden')) window.openSpotlight();
        else window.closeSpotlight();
    }
    if (e.key === 'Escape' && cmdPalette && !cmdPalette.classList.contains('hidden')) {
        window.closeSpotlight();
    }
});

// ==========================================
// 9. QUẢN LÝ CỬA SỔ & ĐA NHIỆM
// ==========================================
const savedState = JSON.parse(localStorage.getItem('app_workspace_state'));
let tabCounter = savedState ? savedState.tabCounter : 1;

const state = {
    tabs: savedState ? savedState.tabs : [{ tabId: 'tab-1', toolId: 'home', pinned: false }],
    activeTabId: savedState ? savedState.activeTabId : 'tab-1',
    tabHistory: savedState ? savedState.tabHistory : ['tab-1'],
    isSplitActive: false,
    splitLeftToolId: null,
    splitRightToolId: null,
    splitRatio: 50
};

function saveState() {
    localStorage.setItem('app_workspace_state', JSON.stringify({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        tabCounter: tabCounter,
        tabHistory: state.tabHistory
    }));
    renderDock();
}

window.openMultitasking = () => {
    renderSwitcherCards();
    appSwitcher.classList.remove('pointer-events-none', 'opacity-0', 'scale-95');
    appSwitcher.classList.add('opacity-100', 'scale-100');
};

window.closeMultitasking = () => {
    appSwitcher.classList.remove('opacity-100', 'scale-100');
    appSwitcher.classList.add('opacity-0', 'scale-95');
    setTimeout(() => appSwitcher.classList.add('pointer-events-none'), 250);
};

document.getElementById('close-switcher-btn')?.addEventListener('click', window.closeMultitasking);

function renderSwitcherCards() {
    if (!switcherCardsWrapper) return;
    switcherCardsWrapper.innerHTML = '';

    const validTabs = state.tabs.filter(t => t.toolId !== 'home');

    if (validTabs.length === 0) {
        switcherCardsWrapper.innerHTML = `
            <div class="w-full flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                <i class="fas fa-folder-open text-4xl mb-2 opacity-50"></i>
                <span class="text-sm">Không có ứng dụng nào đang chạy</span>
            </div>
        `;
        return;
    }

    validTabs.forEach(tab => {
        const tool = getToolData(tab.toolId);
        const card = document.createElement('div');
        card.className = 'switcher-card relative shrink-0 w-[220px] sm:w-[260px] md:w-[280px] h-[320px] sm:h-[380px] rounded-[28px] liquid-glass p-4 sm:p-5 flex flex-col justify-between shadow-2xl border border-white/20 cursor-pointer overflow-hidden';

        card.innerHTML = `
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs shrink-0">
                        <i class="${tool.icon}"></i>
                    </div>
                    <span class="font-bold text-xs sm:text-sm text-white truncate">${tool.name}</span>
                </div>
                <button onclick="window.killTabCard(event, '${tab.tabId}')" class="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition-colors text-xs" title="Đóng tab">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="flex-1 my-3 bg-black/30 rounded-xl border border-white/5 flex flex-col items-center justify-center p-3 text-center">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-2">
                    <i class="${tool.icon}"></i>
                </div>
                <p class="text-[11px] text-zinc-400 line-clamp-3">${tool.desc || 'Ứng dụng hệ thống'}</p>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-white/10">
                <button onclick="window.requestSplitScreen('${tab.toolId}')" 
                    class="flex-1 py-1.5 px-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all" title="Chia 2 app">
                    <i class="fas fa-columns text-[10px]"></i> Chia đôi
                </button>
                <button class="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all" title="Mở">
                    Mở
                </button>
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            switchTab(tab.tabId);
            window.closeMultitasking();
        };

        switcherCardsWrapper.appendChild(card);
    });
}

window.killTabCard = (e, tabId) => {
    window.closeTab(e, tabId);
    renderSwitcherCards();
};

const homeBar = document.getElementById('home-bar-touch-area');
if (homeBar) {
    let homeTouchY = 0;
    let homeTouchTime = 0;

    homeBar.addEventListener('touchstart', e => {
        homeTouchY = e.touches[0].clientY;
        homeTouchTime = Date.now();
    });

    homeBar.addEventListener('touchend', e => {
        const deltaY = homeTouchY - e.changedTouches[0].clientY;
        const duration = Date.now() - homeTouchTime;

        if (deltaY > 50) {
            if (duration > 350) window.openMultitasking();
            else window.goHome();
        }
    });

    homeBar.addEventListener('click', () => {
        const homescreenLauncher = document.getElementById('homescreen-launcher');
        if (homescreenLauncher.classList.contains('hidden') || homescreenLauncher.style.opacity === '0') {
            window.goHome();
        } else {
            window.openMultitasking();
        }
    });
}

// ==========================================
// 10. DYNAMIC ISLAND NOTIFICATION
// ==========================================
const dynamicIsland = document.getElementById('dynamic-island');
const compactView = document.getElementById('island-compact-view');
const alertView = document.getElementById('island-alert-view');
let islandAlertTimer = null;

window.triggerIslandNotification = (title, desc, type = 'info', duration = 3200) => {
    if (!dynamicIsland || !alertView) return;
    if (islandAlertTimer) clearTimeout(islandAlertTimer);

    const alertTitle = document.getElementById('island-alert-title');
    const alertDesc = document.getElementById('island-alert-desc');
    const alertIcon = document.getElementById('island-alert-icon');

    const iconMap = {
        info: { icon: 'fa-info-circle', color: 'text-blue-400' },
        success: { icon: 'fa-check-circle', color: 'text-emerald-400' },
        error: { icon: 'fa-exclamation-triangle', color: 'text-rose-400' },
        warning: { icon: 'fa-exclamation-circle', color: 'text-amber-400' }
    };
    const cfg = iconMap[type] || iconMap.info;

    if (alertTitle) alertTitle.textContent = title;
    if (alertDesc) alertDesc.textContent = desc;
    if (alertIcon) alertIcon.innerHTML = `<i class="fas ${cfg.icon} ${cfg.color}"></i>`;

    compactView.classList.add('hidden');
    dynamicIsland.classList.remove('island-compact');
    dynamicIsland.classList.add('island-alert');

    alertView.classList.remove('hidden');
    alertView.classList.add('flex');
    requestAnimationFrame(() => alertView.classList.replace('opacity-0', 'opacity-100'));

    islandAlertTimer = setTimeout(() => {
        alertView.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => {
            alertView.classList.remove('flex');
            alertView.classList.add('hidden');
            dynamicIsland.classList.remove('island-alert');
            dynamicIsland.classList.add('island-compact');
            compactView.classList.remove('hidden');
            islandAlertTimer = null;
        }, 250);
    }, duration);
};

// ==========================================
// 11. ĐIỀU HƯỚNG APP VÀ MÀN HÌNH CHÍNH
// ==========================================
function showHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.add('hidden');
        contentsContainer.style.display = 'none';
    }
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher) {
        homescreenLauncher.classList.remove('hidden');
        requestAnimationFrame(() => {
            homescreenLauncher.style.opacity = '1';
            homescreenLauncher.style.transform = 'scale(1)';
            homescreenLauncher.style.pointerEvents = 'auto';
        });
    }
    updateStatusbarBackground();
    goToPage(0);
}

function hideHomescreen() {
    if (contentsContainer) {
        contentsContainer.classList.remove('hidden');
        contentsContainer.style.display = 'flex';
    }
    const homescreenLauncher = document.getElementById('homescreen-launcher');
    if (homescreenLauncher) {
        homescreenLauncher.style.opacity = '0';
        homescreenLauncher.style.transform = 'scale(0.96)';
        homescreenLauncher.style.pointerEvents = 'none';
        setTimeout(() => homescreenLauncher.classList.add('hidden'), 250);
    }
    updateStatusbarBackground();
}

window.goHome = () => {
    closeMultitasking();
    showHomescreen();
};

async function openTool(toolId, openInNewTab = false) {
    if (toolId === 'home') {
        window.goHome();
        return;
    }

    hideHomescreen();

    if (state.isSplitActive) {
        window.exitSplitView();
    }

    const currentTab = state.tabs.find(t => t.tabId === state.activeTabId);
    let targetTabId;

    if (openInNewTab || (currentTab && currentTab.pinned) || (currentTab && currentTab.toolId !== 'home' && toolId !== currentTab.toolId)) {
        tabCounter++;
        targetTabId = `tab-${tabCounter}`;
        state.tabs.push({ tabId: targetTabId, toolId: toolId, pinned: false });
    } else {
        targetTabId = state.activeTabId;
        if (currentTab) currentTab.toolId = toolId;
        const oldPane = document.getElementById(`pane-${targetTabId}`);
        if (oldPane) oldPane.remove();
    }

    await renderSinglePane(targetTabId, toolId);
    switchTab(targetTabId);
}
window.openToolGlobal = (id, newTab = false) => openTool(id, newTab);

function createPaneHtml(tool, targetTabId, isSplit = false) {
    return `
        <div class="app-window-header">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                <i class="${tool.icon} text-indigo-400 text-xs"></i>
                <span class="text-xs font-bold tracking-tight text-white">${tool.name}</span>
            </div>
            
            <div class="flex items-center gap-1.5">
                ${!isSplit ? `
                    <button onclick="window.requestSplitScreen('${tool.id}')" class="window-tool-btn hover:border-indigo-400" title="Chia đôi màn hình">
                        <i class="fas fa-columns text-indigo-400"></i> Chia 2 app
                    </button>
                ` : ''}
                ${isSplit ? `
                    <button onclick="window.exitSplitView()" class="window-tool-btn text-rose-300 hover:bg-rose-500/20" title="Trở về 1 màn hình">
                        <i class="fas fa-compress-arrows-alt"></i> Thoát chia đôi
                    </button>
                ` : ''}
                <button onclick="window.closeTab(event, '${targetTabId}')" class="window-tool-btn hover:text-red-400" title="Đóng ứng dụng">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="view-pane-body" id="body-${targetTabId}">
            <div class="flex items-center gap-3 py-32 justify-center text-zinc-400">
                <i class="fas fa-circle-notch fa-spin text-xl"></i> Đang tải tiện ích...
            </div>
        </div>
    `;
}

async function renderSinglePane(targetTabId, toolId) {
    let pane = document.getElementById(`pane-${targetTabId}`);
    if (!pane) {
        pane = document.createElement('div');
        pane.id = `pane-${targetTabId}`;
        pane.className = 'view-pane w-full h-full bg-white dark:bg-[#0d1117] text-zinc-900 dark:text-zinc-100 shadow-2xl transition-colors duration-300';
        singleAppHost.appendChild(pane);
    }

    const tool = getToolData(toolId);
    if (!tool) return;

    if (toolId === 'home') {
        showHomescreen();
        pane.innerHTML = '';
        return;
    }

    pane.innerHTML = createPaneHtml(tool, targetTabId, false);
    const paneBody = pane.querySelector(`#body-${targetTabId}`);

    try {
        const module = await import(`../tools/${toolId}/index.js`);
        paneBody.innerHTML = module.template();
        if (module.init) module.init();
    } catch (e) {
        paneBody.innerHTML = `<div class="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900 m-4">Lỗi nạp tiện ích: ${e.message}</div>`;
    }
}

// ==========================================
// 12. CHIA ĐÔI MÀN HÌNH VÀ THANH KÉO RESIZER
// ==========================================
const splitPickerModal = document.getElementById('split-picker-modal');
const splitPickerApps = document.getElementById('split-picker-apps');
const splitPickerTitle = document.getElementById('split-picker-title');
const splitPickerDesc = document.getElementById('split-picker-desc');

window.requestSplitScreen = (currentToolId) => {
    window.closeMultitasking();
    const otherOpenTabs = state.tabs.filter(t => t.toolId !== 'home' && t.toolId !== currentToolId);

    if (otherOpenTabs.length === 0) {
        openSplitPickerModal(currentToolId, TOOLS.filter(t => t.id !== currentToolId), 'Chọn ứng dụng mới', 'Chưa có ứng dụng thứ 2 nào đang chạy');
        return;
    }

    if (otherOpenTabs.length === 1) {
        window.startSplitView(currentToolId, otherOpenTabs[0].toolId);
        return;
    }

    const openToolsList = otherOpenTabs.map(t => getToolData(t.toolId));
    openSplitPickerModal(currentToolId, openToolsList, 'Chọn từ ứng dụng đang chạy', 'Chọn 1 trong các ứng dụng đang mở để ghép đôi');
};

function openSplitPickerModal(currentToolId, listToRender, title, desc) {
    if (!splitPickerApps) return;

    if (splitPickerTitle) splitPickerTitle.innerHTML = `<i class="fas fa-columns text-indigo-400"></i> ${title}`;
    if (splitPickerDesc) splitPickerDesc.textContent = desc;

    splitPickerApps.innerHTML = listToRender.map(t => `
        <div onclick="window.startSplitView('${currentToolId}', '${t.id}')"
            class="p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 cursor-pointer flex flex-col items-center justify-center text-center transition-all group">
            <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl text-indigo-300 group-hover:scale-110 transition-transform mb-2">
                <i class="${t.icon}"></i>
            </div>
            <div class="text-xs font-semibold text-white truncate w-full">${t.name}</div>
        </div>
    `).join('');

    splitPickerModal.classList.remove('pointer-events-none', 'opacity-0');
    splitPickerModal.classList.add('opacity-100');
}

window.closeSplitPicker = () => {
    splitPickerModal.classList.replace('opacity-100', 'opacity-0');
    setTimeout(() => splitPickerModal.classList.add('pointer-events-none'), 250);
};

window.startSplitView = async (leftToolId, rightToolId) => {
    window.closeSplitPicker();
    hideHomescreen();

    state.isSplitActive = true;
    state.splitLeftToolId = leftToolId;
    state.splitRightToolId = rightToolId;

    singleAppHost.classList.add('hidden');
    splitAppHost.classList.remove('hidden');

    const isMobilePortrait = window.innerWidth < 768;
    if (isMobilePortrait) {
        splitLeftPane.style.width = '100%';
        splitLeftPane.style.height = `${state.splitRatio}%`;
        splitRightPane.style.width = '100%';
        splitRightPane.style.height = `${100 - state.splitRatio}%`;
    } else {
        splitLeftPane.style.height = '100%';
        splitLeftPane.style.width = `${state.splitRatio}%`;
        splitRightPane.style.height = '100%';
        splitRightPane.style.width = `${100 - state.splitRatio}%`;
    }

    const toolL = getToolData(leftToolId);
    splitLeftPane.innerHTML = createPaneHtml(toolL, `split-left-${leftToolId}`, true);
    try {
        const modL = await import(`../tools/${leftToolId}/index.js`);
        splitLeftPane.querySelector(`#body-split-left-${leftToolId}`).innerHTML = modL.template();
        if (modL.init) modL.init();
    } catch (e) { }

    const toolR = getToolData(rightToolId);
    splitRightPane.innerHTML = createPaneHtml(toolR, `split-right-${rightToolId}`, true);
    try {
        const modR = await import(`../tools/${rightToolId}/index.js`);
        splitRightPane.querySelector(`#body-split-right-${rightToolId}`).innerHTML = modR.template();
        if (modR.init) modR.init();
    } catch (e) { }

    UI.showAlert('Split View', `Đang chạy song song ${toolL.name} & ${toolR.name}`, 'info');
};

window.exitSplitView = () => {
    state.isSplitActive = false;
    splitAppHost.classList.add('hidden');
    singleAppHost.classList.remove('hidden');
    splitLeftPane.innerHTML = '';
    splitRightPane.innerHTML = '';
};

// Kéo chỉnh kích thước thanh chia đôi
const splitResizer = document.getElementById('split-resizer');
let isResizing = false;

function handleResizerStart() {
    isResizing = true;
    splitResizer.classList.add('resizing');
    document.body.style.userSelect = 'none';
}

function handleResizerMove(e) {
    if (!isResizing || !state.isSplitActive) return;

    const isMobilePortrait = window.innerWidth < 768;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isMobilePortrait) {
        const totalH = splitAppHost.getBoundingClientRect().height;
        const offsetTop = clientY - splitAppHost.getBoundingClientRect().top;
        let percentage = (offsetTop / totalH) * 100;
        percentage = Math.max(20, Math.min(80, percentage));

        splitLeftPane.style.height = `${percentage}%`;
        splitRightPane.style.height = `${100 - percentage}%`;
        state.splitRatio = percentage;
    } else {
        const totalW = splitAppHost.getBoundingClientRect().width;
        const offsetLeft = clientX - splitAppHost.getBoundingClientRect().left;
        let percentage = (offsetLeft / totalW) * 100;
        percentage = Math.max(20, Math.min(80, percentage));

        splitLeftPane.style.width = `${percentage}%`;
        splitRightPane.style.width = `${100 - percentage}%`;
        state.splitRatio = percentage;
    }
}

function handleResizerEnd() {
    if (isResizing) {
        isResizing = false;
        splitResizer.classList.remove('resizing');
        document.body.style.userSelect = '';
    }
}

if (splitResizer) {
    splitResizer.addEventListener('mousedown', handleResizerStart);
    splitResizer.addEventListener('touchstart', handleResizerStart, { passive: true });

    window.addEventListener('mousemove', handleResizerMove);
    window.addEventListener('touchmove', handleResizerMove, { passive: true });

    window.addEventListener('mouseup', handleResizerEnd);
    window.addEventListener('touchend', handleResizerEnd);
}

function switchTab(tabId) {
    state.activeTabId = tabId;
    if (state.tabHistory[state.tabHistory.length - 1] !== tabId) state.tabHistory.push(tabId);

    const activeTab = state.tabs.find(t => t.tabId === tabId);
    if (activeTab && activeTab.toolId === 'home') {
        showHomescreen();
    } else {
        hideHomescreen();
    }

    document.querySelectorAll('#single-app-host .view-pane').forEach(p => p.classList.remove('active'));
    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) activePane.classList.add('active');

    renderDesktopTabs();
    saveState();
}
window.switchTab = switchTab;

window.closeTab = (e, tabId) => {
    if (e) e.stopPropagation();

    if (state.isSplitActive) {
        window.exitSplitView();
    }

    state.tabs = state.tabs.filter(t => t.tabId !== tabId);
    const pane = document.getElementById(`pane-${tabId}`);
    if (pane) pane.remove();

    if (state.tabs.length === 0) {
        openTool('home', true);
        return;
    }

    if (state.activeTabId === tabId) {
        state.tabHistory = state.tabHistory.filter(id => id !== tabId);
        let nextId = state.tabs[state.tabs.length - 1].tabId;
        switchTab(nextId);
    } else {
        saveState();
        renderSwitcherCards();
        renderDesktopTabs();
    }
};

window.closeAllTabs = () => {
    if (state.isSplitActive) window.exitSplitView();
    tabCounter = 1;
    state.tabs = [{ tabId: 'tab-1', toolId: 'home', pinned: false }];
    state.activeTabId = 'tab-1';
    state.tabHistory = ['tab-1'];
    singleAppHost.innerHTML = '';
    showHomescreen();
    closeMultitasking();
    renderDesktopTabs();
    saveState();
};

function renderDesktopTabs() {
    const desktopTabStrip = document.getElementById('desktop-menubar-tabs');
    if (!desktopTabStrip) return;

    desktopTabStrip.innerHTML = state.tabs.map(tab => {
        const isActive = state.activeTabId === tab.tabId;
        const tool = getToolData(tab.toolId);
        return `
            <div class="px-2.5 py-0.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}" onclick="switchTab('${tab.tabId}')">
                <i class="${tool.icon} text-[10px]"></i>
                <span class="truncate max-w-[90px] text-[11px]">${tool.name}</span>
                <button onclick="window.closeTab(event, '${tab.tabId}')" class="text-white/40 hover:text-red-400 ml-1">
                    <i class="fas fa-times text-[9px]"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Battery API
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

// Modal Cài đặt
const settingsModal = document.getElementById('settings-modal');
const settingsContent = document.getElementById('settings-content');
document.getElementById('open-settings-btn')?.addEventListener('click', () => {
    settingsModal.classList.remove('pointer-events-none', 'opacity-0');
    settingsModal.classList.add('opacity-100');
    settingsContent.classList.replace('scale-95', 'scale-100');
});
document.getElementById('close-settings-btn')?.addEventListener('click', () => {
    settingsModal.classList.replace('opacity-100', 'opacity-0');
    settingsContent.classList.replace('scale-100', 'scale-95');
    setTimeout(() => settingsModal.classList.add('pointer-events-none'), 250);
});

// Dynamic Island Switch
const islandToggleBtn = document.getElementById('toggle-island-setting');
const islandThumb = document.getElementById('island-toggle-thumb');
const islandWrapper = document.getElementById('dynamic-island-wrapper');

let isIslandEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
if (!isIslandEnabled) {
    islandThumb?.classList.remove('translate-x-6');
    islandWrapper?.classList.add('hidden');
}

islandToggleBtn?.addEventListener('click', () => {
    isIslandEnabled = !isIslandEnabled;
    localStorage.setItem('hunqos_dynamic_island', isIslandEnabled);
    islandThumb?.classList.toggle('translate-x-6', isIslandEnabled);
    islandWrapper?.classList.toggle('hidden', !isIslandEnabled);
});

// Contextmenu Switch
const contextmenuToggleBtn = document.getElementById('toggle-contextmenu-setting');
const contextmenuThumb = document.getElementById('contextmenu-toggle-thumb');

if (!isContextMenuBlocked) {
    contextmenuThumb?.classList.remove('translate-x-6');
    contextmenuToggleBtn?.classList.replace('bg-indigo-600', 'bg-zinc-700');
}

contextmenuToggleBtn?.addEventListener('click', () => {
    isContextMenuBlocked = !isContextMenuBlocked;
    localStorage.setItem('hunqos_block_contextmenu', isContextMenuBlocked);
    contextmenuThumb?.classList.toggle('translate-x-6', isContextMenuBlocked);
    if (isContextMenuBlocked) {
        contextmenuToggleBtn.classList.replace('bg-zinc-700', 'bg-indigo-600');
        UI.showAlert('Bảo vệ', 'Đã bật chặn menu chuột phải.', 'info');
    } else {
        contextmenuToggleBtn.classList.replace('bg-indigo-600', 'bg-zinc-700');
        UI.showAlert('Bảo vệ', 'Đã cho phép dùng menu chuột phải.', 'warning');
    }
});

// ==========================================
// 13. KHỞI TẠO HUNQOS
// ==========================================
async function initHunqOS() {
    detectDeviceMode();
    activeGrid = getGridDimensions();
    homeLayout = getInitialLayout();

    const savedWp = await getWallpaperFromDB();
    if (savedWp) applyWallpaper(savedWp);

    renderDock();
    initHomescreenPages();

    for (const tab of state.tabs) {
        if (tab.toolId !== 'home') await renderSinglePane(tab.tabId, tab.toolId);
    }
    switchTab(state.activeTabId);
    updateStatusbarBackground();
}

window.addEventListener('resize', () => {
    const nextGrid = getGridDimensions();
    if (nextGrid.rows !== activeGrid.rows || nextGrid.cols !== activeGrid.cols || nextGrid.key !== activeGrid.key) {
        activeGrid = nextGrid;
        homeLayout = getInitialLayout();
        currentPageIndex = 0;
        initHomescreenPages();
    }
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        activeGrid = getGridDimensions();
        homeLayout = getInitialLayout();
        currentPageIndex = 0;
        initHomescreenPages();
    }, 150);
});

initHunqOS();