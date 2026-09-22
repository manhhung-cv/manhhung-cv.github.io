// js/launcher.js
import { CATEGORIES as CONFIG_CATEGORIES, TOOLS } from './config.js';
import { UI } from './ui.js';
import { getGridColumns } from './device.js';
import { getRecentToolIds, getToolData } from './app-manager.js';
import { syncWallpaperDisplay } from './settings.js';

// Trạng thái HunqOS
let isCompactGridMode = localStorage.getItem('hunqos_compact_grid') === 'true';
let currentPageIndex = 0;
let totalPages = 1;

// Trạng thái Pure Minimal Web Portal
let minimalCurrentCat = 'all';
let minimalFavorites = JSON.parse(localStorage.getItem('hunqos_min_favs') || '[]');
let minimalViewMode = localStorage.getItem('hunqos_min_view') || 'grid';

function resolveColorCss(colorValue, isBackground = true) {
    if (!colorValue || typeof colorValue !== 'string') return '';
    const trimmed = colorValue.trim();
    const isGrad = trimmed.includes('gradient(');
    if (isBackground) return isGrad ? `background-image: ${trimmed};` : `background-color: ${trimmed};`;
    return isGrad ? `background-image: ${trimmed};` : `color: ${trimmed};`;
}

export function computeIconStyles(tool) {
    const rawColor = tool.bgColor || tool.color || 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
    const bgStyle = resolveColorCss(rawColor, true);
    const iconStyle = `color: ${tool.iconColor || '#ffffff'};`;
    return { bgStyle, iconStyle, iconClass: '' };
}

/* ========================================================
   1. BỐ CỤC HUNQOS OS LAUNCHER
   ======================================================== */
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

export function goToPage(index) {
    const viewport = document.getElementById('launcher-viewport');
    if (!viewport) return;
    currentPageIndex = Math.max(0, Math.min(index, totalPages - 1));
    viewport.scrollTo({
        left: currentPageIndex * viewport.clientWidth,
        behavior: 'smooth'
    });
    renderPageDots();
}

export function getTargetHomePageIndex() {
    return (!isCompactGridMode && totalPages > 1) ? 1 : 0;
}

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

export function initHomescreenPages() {
    const pagesSlider = document.getElementById('launcher-pages-slider');
    if (!pagesSlider) return;
    const cols = getGridColumns();
    pagesSlider.innerHTML = '';

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

    const rawPageCount = getPageCount();
    totalPages = 1 + rawPageCount;

    // Trang 0: Gợi ý & gần đây
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

    // Trang 1 trở đi: Theo danh mục
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

export function renderDock() {
    const DEFAULT_DOCK = [
        { type: 'tool', id: 'home' },
        { type: 'action', action: 'spotlight', icon: 'fas fa-search', name: 'Tìm kiếm' },
        { type: 'action', action: 'multitask', icon: 'fas fa-layer-group', name: 'Cửa sổ' },
        { type: 'action', action: 'settings', icon: 'fas fa-cog', name: 'Cài đặt' }
    ];

    let dockList = JSON.parse(localStorage.getItem('hunqos_dock_items')) || DEFAULT_DOCK;
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

/* ========================================================
   2. BỐ CỤC PURE MINIMAL (SAAS RESPONSIVE DASHBOARD)
   ======================================================== */
function saveMinimalFavorites() {
    localStorage.setItem('hunqos_min_favs', JSON.stringify(minimalFavorites));
    updateMinimalBadges();
}

window.toggleMinimalFav = (toolId, event) => {
    if (event) event.stopPropagation();
    if (minimalFavorites.includes(toolId)) {
        minimalFavorites = minimalFavorites.filter(id => id !== toolId);
    } else {
        minimalFavorites.push(toolId);
    }
    saveMinimalFavorites();
    renderPureMinimalDashboard(document.getElementById('minimal-search-input')?.value || '');
};

function updateMinimalBadges() {
    const totalBadge = document.getElementById('min-badge-total');
    const favsBadge = document.getElementById('min-badge-favs');
    if (totalBadge) totalBadge.textContent = TOOLS.length;
    if (favsBadge) favsBadge.textContent = minimalFavorites.length;
}

function renderPureMinimalSidebar() {
    const container = document.getElementById('minimal-sidebar-categories');
    if (!container) return;

    container.innerHTML = CONFIG_CATEGORIES.map(cat => {
        const count = TOOLS.filter(t => t.catId === cat.id).length;
        const isActive = minimalCurrentCat === cat.id;
        return `
            <button onclick="window.filterMinimalCategory('${cat.id}')" id="min-nav-${cat.id}"
                class="min-sidebar-btn ${isActive ? 'active' : ''} w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all">
                <div class="flex items-center gap-2.5 truncate">
                    <i class="${cat.icon || 'fas fa-cube'} text-xs opacity-70"></i>
                    <span class="truncate">${cat.name}</span>
                </div>
                <span class="text-[10px] min-badge-pill px-1.5 py-0.5 rounded font-mono">${count}</span>
            </button>
        `;
    }).join('');

    renderPureMinimalMobilePills();
    updateMinimalBadges();
}

function renderPureMinimalMobilePills() {
    const pillsContainer = document.getElementById('minimal-mobile-pills');
    if (!pillsContainer) return;

    const allOptions = [
        { id: 'all', name: 'Tất cả', icon: 'fas fa-border-all' },
        { id: 'favorites', name: 'Yêu thích', icon: 'fas fa-star' },
        ...CONFIG_CATEGORIES
    ];

    pillsContainer.innerHTML = allOptions.map(cat => {
        const isActive = minimalCurrentCat === cat.id;
        return `
            <button onclick="window.filterMinimalCategory('${cat.id}')"
                class="min-mobile-pill shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? 'active' : ''}">
                <i class="${cat.icon || 'fas fa-cube'} text-[10px]"></i>
                <span class="whitespace-nowrap">${cat.name}</span>
            </button>
        `;
    }).join('');
}

function createToolCardHtml(tool) {
    const { bgStyle, iconStyle, iconClass } = computeIconStyles(tool);
    const cat = CONFIG_CATEGORIES.find(c => c.id === tool.catId);
    const catName = cat ? cat.name : 'Tiện ích';
    const isFav = minimalFavorites.includes(tool.id);

    // Chế độ Danh sách (List View Mode)
    if (minimalViewMode === 'list') {
        return `
            <div onclick="window.openToolGlobal('${tool.id}')"
                 class="min-tool-card min-tool-card-list group relative border rounded-xl p-3 sm:p-3.5 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 border border-white/10 group-hover:scale-105 transition-transform" style="${bgStyle}">
                        <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h3 class="text-xs sm:text-sm font-semibold truncate transition-colors min-text-main group-hover:min-accent-text">${tool.name}</h3>
                            <span class="text-[9px] font-medium tracking-wide uppercase px-1.5 py-0.2 rounded min-badge-pill border min-border-color shrink-0 hidden sm:inline-block">
                                ${catName}
                            </span>
                        </div>
                        <p class="text-[11px] min-text-muted truncate max-w-sm">${tool.desc || 'Mở tiện ích để làm việc.'}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <button onclick="window.toggleMinimalFav('${tool.id}', event)" class="p-2 rounded-lg min-text-muted hover:text-amber-400 transition-colors" title="${isFav ? 'Bỏ ghim' : 'Ghim'}">
                        <i class="${isFav ? 'fas fa-star text-amber-400' : 'far fa-star'} text-xs"></i>
                    </button>
                    <i class="fas fa-arrow-right text-[10px] min-text-muted group-hover:min-text-main group-hover:translate-x-0.5 transition-all"></i>
                </div>
            </div>
        `;
    }

    // Chế độ Lưới Card (Grid View Mode)
    return `
        <div onclick="window.openToolGlobal('${tool.id}')"
             class="min-tool-card group relative border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between">
            <div>
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/10 group-hover:scale-105 transition-transform" style="${bgStyle}">
                        <i class="${tool.icon} ${iconClass}" style="${iconStyle}"></i>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md min-badge-pill border min-border-color">
                            ${catName}
                        </span>
                        <button onclick="window.toggleMinimalFav('${tool.id}', event)" class="p-1.5 rounded-lg min-text-muted hover:text-amber-400 transition-colors" title="${isFav ? 'Bỏ ghim' : 'Ghim ưu tiên'}">
                            <i class="${isFav ? 'fas fa-star text-amber-400' : 'far fa-star'} text-xs"></i>
                        </button>
                    </div>
                </div>
                
                <h3 class="text-sm font-semibold mb-1 truncate transition-colors min-text-main group-hover:min-accent-text">${tool.name}</h3>
                <p class="text-xs min-text-muted line-clamp-2 leading-relaxed mb-4">${tool.desc || 'Mở tiện ích để làm việc.'}</p>
            </div>

            <div class="pt-3 border-t min-border-color flex items-center justify-between text-[11px] min-text-muted group-hover:min-text-main transition-colors">
                <span class="inline-flex items-center gap-1 font-mono text-[10px]">
                    <i class="fas fa-play text-[8px] min-accent-text"></i> Khởi chạy
                </span>
                <i class="fas fa-arrow-right text-[10px] -translate-x-1 group-hover:translate-x-0 transition-transform"></i>
            </div>
        </div>
    `;
}

function renderPureMinimalDashboard(filterQuery = '') {
    const listEl = document.getElementById('minimal-app-list');
    const favsList = document.getElementById('minimal-favs-list');
    const favsSection = document.getElementById('minimal-favs-section');
    const countBadge = document.getElementById('minimal-count-badge');
    const gridTitle = document.getElementById('minimal-grid-title');
    const breadcrumb = document.getElementById('minimal-breadcrumb');
    const heroBanner = document.getElementById('minimal-hero-banner');
    const clearSearchBtn = document.getElementById('minimal-search-clear');

    if (!listEl) return;

    const query = filterQuery.trim().toLowerCase();
    if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', !query);

    // Đồng bộ tab Sidebar và Mobile Pills
    document.querySelectorAll('.min-sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.min-mobile-pill').forEach(btn => btn.classList.remove('active'));

    const currentSideBtn = document.getElementById(`min-nav-${minimalCurrentCat}`);
    if (currentSideBtn) currentSideBtn.classList.add('active');

    // Chuyển đổi class Grid dựa vào view mode
    if (minimalViewMode === 'list') {
        listEl.className = 'grid grid-cols-1 gap-2 pb-28 md:pb-12';
        if (favsList) favsList.className = 'grid grid-cols-1 gap-2';
    } else {
        listEl.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-28 md:pb-12';
        if (favsList) favsList.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3';
    }

    if (heroBanner) heroBanner.classList.toggle('hidden', minimalCurrentCat !== 'all' || query.length > 0);

    let toolsToDisplay = TOOLS;
    if (minimalCurrentCat === 'favorites') {
        toolsToDisplay = TOOLS.filter(t => minimalFavorites.includes(t.id));
        if (breadcrumb) breadcrumb.textContent = 'Yêu thích & Đã ghim';
        if (gridTitle) gridTitle.textContent = 'Danh sách đã ghim';
    } else if (minimalCurrentCat !== 'all') {
        const cat = CONFIG_CATEGORIES.find(c => c.id === minimalCurrentCat);
        toolsToDisplay = TOOLS.filter(t => t.catId === minimalCurrentCat);
        if (breadcrumb) breadcrumb.textContent = cat ? cat.name : 'Danh mục';
        if (gridTitle) gridTitle.textContent = cat ? cat.name : 'Danh mục';
    } else {
        if (breadcrumb) breadcrumb.textContent = 'Tất cả tiện ích';
        if (gridTitle) gridTitle.textContent = query ? `Kết quả tìm kiếm ("${query}")` : 'Tất cả tiện ích';
    }

    if (query) {
        toolsToDisplay = toolsToDisplay.filter(t => t.name.toLowerCase().includes(query) || (t.desc && t.desc.toLowerCase().includes(query)));
    }

    if (countBadge) countBadge.textContent = toolsToDisplay.length;

    // Hiển thị phần Pins khi ở All và không search
    if (favsSection && favsList) {
        if (minimalCurrentCat === 'all' && !query && minimalFavorites.length > 0) {
            favsSection.classList.remove('hidden');
            const favTools = minimalFavorites.map(id => getToolData(id)).filter(Boolean);
            favsList.innerHTML = favTools.map(t => createToolCardHtml(t)).join('');
        } else {
            favsSection.classList.add('hidden');
        }
    }

    if (toolsToDisplay.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full py-16 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                <i class="fas fa-search text-3xl opacity-30 mb-1"></i>
                <span class="font-medium text-zinc-400">Không tìm thấy tiện ích nào</span>
                <span class="text-[11px] text-zinc-500">Thử kiểm tra lại từ khóa hoặc chuyển sang danh mục khác</span>
            </div>
        `;
        return;
    }

    listEl.innerHTML = toolsToDisplay.map(tool => createToolCardHtml(tool)).join('');
}

export function applyPureMinimalMode(enable) {
    document.body.classList.toggle('pure-minimal-mode', enable);
    const toggleBtn = document.getElementById('toggle-minimal-setting');
    toggleBtn?.classList.toggle('active', enable);

    const topBar = document.getElementById('top-system-bar');
    if (topBar) topBar.style.display = enable ? 'none' : '';

    const deviceSettingsBlock = document.getElementById('device-mode-settings-block');
    const organizerSettingsBlock = document.getElementById('hunqos-organizer-settings-group');
    if (deviceSettingsBlock) deviceSettingsBlock.style.display = enable ? 'none' : '';
    if (organizerSettingsBlock) organizerSettingsBlock.style.display = enable ? 'none' : '';

    syncWallpaperDisplay();

    if (enable) {
        renderPureMinimalSidebar();
        renderPureMinimalDashboard();
    }
}

window.applyPureMinimalModeGlobal = applyPureMinimalMode;

export function initMinimalSidebarEvents() {
    const viewToggleBtn = document.getElementById('minimal-view-toggle');
    const viewIcon = document.getElementById('min-view-icon');

    const updateViewIcon = () => {
        if (!viewIcon) return;
        viewIcon.className = minimalViewMode === 'list' ? 'fas fa-grip-vertical text-xs' : 'fas fa-list text-xs';
    };
    updateViewIcon();

    viewToggleBtn?.addEventListener('click', () => {
        minimalViewMode = minimalViewMode === 'grid' ? 'list' : 'grid';
        localStorage.setItem('hunqos_min_view', minimalViewMode);
        updateViewIcon();
        renderPureMinimalDashboard(document.getElementById('minimal-search-input')?.value || '');
    });

    window.filterMinimalCategory = (catId) => {
        minimalCurrentCat = catId;
        renderPureMinimalSidebar();
        renderPureMinimalDashboard(document.getElementById('minimal-search-input')?.value || '');
    };

    const searchInput = document.getElementById('minimal-search-input');
    const clearBtn = document.getElementById('minimal-search-clear');

    searchInput?.addEventListener('input', (e) => {
        renderPureMinimalDashboard(e.target.value);
    });

    clearBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        renderPureMinimalDashboard('');
    });
}

/* ========================================================
   3. KHỞI TẠO CHUNG
   ======================================================== */
export function initLauncher() {
    document.getElementById('toggle-minimal-setting')?.addEventListener('click', () => {
        const newState = !(localStorage.getItem('hunqos_pure_minimal') === 'true');
        localStorage.setItem('hunqos_pure_minimal', newState);
        applyPureMinimalMode(newState);
        UI.showAlert('Giao diện', newState ? 'Đã chuyển sang Web Portal.' : 'Đã trở lại HunqOS Workspace.', 'info');
    });

    const compactToggleBtn = document.getElementById('toggle-compact-setting');
    if (compactToggleBtn) {
        compactToggleBtn.classList.toggle('active', isCompactGridMode);
        compactToggleBtn.addEventListener('click', () => {
            isCompactGridMode = !isCompactGridMode;
            localStorage.setItem('hunqos_compact_grid', isCompactGridMode);
            compactToggleBtn.classList.toggle('active', isCompactGridMode);
            currentPageIndex = 0;
            initHomescreenPages();
            UI.showAlert('Bố cục Launcher', isCompactGridMode ? 'Đã gom gọn tất cả ứng dụng.' : 'Đã chia trang theo từng danh mục.', 'info');
        });
    }

    window.autoOrganizeByCategories = () => {
        pageLayout = createLayoutFromCategories();
        selectedOrganizerPage = 0;
        selectedToolsForBatch.clear();
        savePageLayout();
        initHomescreenPages();
        UI.showAlert('Bố cục', 'Đã gom nhóm ứng dụng theo danh mục.', 'success');
    };

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

    if (pageDotsWrapper) {
        pageDotsWrapper.addEventListener('touchstart', expandPageDots, { passive: true });
        document.addEventListener('touchstart', (e) => {
            if (!pageDotsWrapper.contains(e.target)) {
                pageDotsWrapper.classList.remove('expanded');
            }
        }, { passive: true });
    }

    initMinimalSidebarEvents();
}